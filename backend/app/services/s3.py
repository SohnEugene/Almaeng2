import os
import boto3
from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError
from typing import Optional

# Custom exceptions for S3 operations
class S3Exception(Exception):
    """Base exception for S3 operations"""
    pass

class S3UploadException(S3Exception):
    """Exception raised when S3 upload fails"""
    def __init__(self, key: str, reason: str):
        self.key = key
        self.reason = reason
        super().__init__(f"Failed to upload {key}: {reason}")

class S3PresignedException(S3Exception):
    """Exception raised when presigned URL generation fails"""
    def __init__(self, key: str, reason: str):
        self.key = key
        self.reason = reason
        super().__init__(f"Failed to generate presigned URL for {key}: {reason}")

class S3ConfigException(S3Exception):
    """Exception raised when S3 configuration is invalid"""
    def __init__(self, reason: str):
        self.reason = reason
        super().__init__(f"S3 configuration error: {reason}")


# S3 클라이언트를 lazy initialization으로 생성
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
        """
        S3 버킷에 파일 업로드

        Args:
            file_obj: 파일 객체 (예: FastAPI UploadFile.file)
            key: S3 내 저장 경로, 예: 'products/product1.png'
            content_type: MIME 타입

        Returns:
            업로드 성공 여부

        Raises:
            S3UploadException: 업로드 실패 시
            S3ConfigException: AWS 설정 오류 시
        """
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
    def generate_presigned_url(key: str, expires_in: int = 3600) -> Optional[str]:
        """
        S3 presigned URL 생성

        Args:
            key: S3 내 저장 경로
            expires_in: 유효기간(초), 기본 1시간

        Returns:
            presigned URL 또는 None (실패 시)
        """
        if not key:
            return None

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
            # AWS 설정이 없으면 None 반환 (presigned URL은 선택적 기능)
            return None
        except (NoCredentialsError, PartialCredentialsError):
            return None
        except ClientError as e:
            print(f"Presigned URL 생성 에러: {e}")
            return None
        except Exception as e:
            print(f"Presigned URL 일반 에러: {type(e).__name__}: {e}")
            return None

    @staticmethod
    def convert_to_presigned_url(image_url: Optional[str], expires_in: int = 3600) -> Optional[str]:
        """
        image_url이 S3 key인 경우 presigned URL로 변환

        Args:
            image_url: 이미지 URL 또는 S3 key
            expires_in: URL 유효기간(초)

        Returns:
            presigned URL 또는 원본 URL
        """
        if not image_url:
            return None

        # S3 key 패턴인 경우에만 변환
        if image_url.startswith("products/"):
            presigned_url = S3Service.generate_presigned_url(image_url, expires_in)
            return presigned_url if presigned_url else image_url

        # 이미 URL인 경우 그대로 반환
        return image_url
