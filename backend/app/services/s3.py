import os
from typing import Optional

import boto3
from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError

from app.exceptions import (
    S3ConfigException,
    S3PresignedException,
    S3UploadException,
)


# lazy initialization
_s3_client = None

def get_s3_client():
    """Get or create S3 client with lazy initialization"""
    global _s3_client
    if _s3_client is None:
        access_key = os.getenv("AWS_ACCESS_KEY_ID", "").strip()
        secret_key = os.getenv("AWS_SECRET_ACCESS_KEY", "").strip()
        region = os.getenv("AWS_REGION", "ap-northeast-2").strip()

        if not access_key or not secret_key:
            raise S3ConfigException("AWS credentials not configured")

        _s3_client = boto3.client(
            "s3",
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region,
        )
    return _s3_client

def get_bucket_name() -> str:
    """Get S3 bucket name from environment"""
    return os.getenv("S3_BUCKET_NAME", "almaeng2")


class S3Service:
    @staticmethod
    def upload_file(file_obj, key: str, content_type: str = "image/png") -> bool:
        """ Upload image file on S3 bucket"""
        try:
            client = get_s3_client()
            bucket = get_bucket_name()

            client.upload_fileobj(
                Fileobj=file_obj,
                Bucket=bucket,
                Key=key,
                ExtraArgs={"ContentType": content_type}
            )
            return True

        except S3ConfigException:
            raise
        except NoCredentialsError as e:
            raise S3UploadException(key, "AWS credentials not found") from e
        except PartialCredentialsError as e:
            raise S3UploadException(key, "Incomplete AWS credentials") from e
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            raise S3UploadException(key, f"AWS error: {error_code}") from e
        except Exception as e:
            raise S3UploadException(key, str(e)) from e

    @staticmethod
    def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
        """ Generate S3 presigned URL"""
        if not key:
            raise S3PresignedException(key, "S3 key is empty")

        try:
            client = get_s3_client()
            bucket = get_bucket_name()

            url = client.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": bucket, "Key": key},
                ExpiresIn=expires_in
            )
            return url

        except S3ConfigException:
            raise
        except NoCredentialsError as e:
            raise S3PresignedException(key, "AWS credentials not found") from e
        except PartialCredentialsError as e:
            raise S3PresignedException(key, "Incomplete AWS credentials") from e
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            raise S3PresignedException(key, f"AWS error: {error_code}") from e
        except Exception as e:
            raise S3PresignedException(key, str(e)) from e

    @staticmethod
    def convert_to_presigned_url(image_url: Optional[str], expires_in: int = 3600) -> Optional[str]:
        """ convert S3 key to presigned URL if image_url were S3 key"""
        if not image_url:
            return None

        if image_url.startswith("products/"):
            return S3Service.generate_presigned_url(image_url, expires_in)

        return image_url


# create a singleton instance
s3_service = S3Service()
