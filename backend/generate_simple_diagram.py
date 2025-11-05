#!/usr/bin/env python3
"""
Generate a simplified class diagram for the Kiosk Management System
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Installing Pillow package...")
    import subprocess
    subprocess.check_call(["pip", "install", "pillow"])
    from PIL import Image, ImageDraw, ImageFont

def create_simplified_diagram():
    """Create a simplified architecture diagram"""

    # Image dimensions
    width = 1400
    height = 1000

    # Create image with white background
    img = Image.new('RGB', (width, height), 'white')
    draw = ImageDraw.Draw(img)

    # Try to use a nice font
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 20)
        header_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 16)
        text_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 12)
        small_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 10)
    except:
        title_font = header_font = text_font = small_font = ImageFont.load_default()

    # Colors
    model_color = '#E3F2FD'       # Light blue
    service_color = '#C8E6C9'     # Light green
    router_color = '#FFF9C4'      # Light yellow
    util_color = '#F8BBD0'        # Light pink
    app_color = '#FFCCBC'         # Light orange
    border_color = '#333333'      # Dark gray
    text_color = '#000000'        # Black
    arrow_color = '#666666'       # Gray

    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def draw_box(x, y, w, h, title, items, color, stereotype=""):
        """Draw a class box"""
        color_rgb = hex_to_rgb(color)
        border_rgb = hex_to_rgb(border_color)

        # Draw border
        draw.rectangle([x, y, x+w, y+h], outline=border_rgb, fill=color_rgb, width=2)

        # Draw stereotype
        if stereotype:
            draw.text((x+w//2, y+8), f"<<{stereotype}>>", fill=arrow_color,
                     font=small_font, anchor="mm")
            title_y = y + 25
        else:
            title_y = y + 15

        # Draw title
        draw.text((x+w//2, title_y), title, fill=text_color, font=header_font, anchor="mm")

        # Draw separator line
        sep_y = title_y + 20
        draw.line([(x, sep_y), (x+w, sep_y)], fill=border_rgb, width=1)

        # Draw items
        item_y = sep_y + 8
        for item in items:
            draw.text((x+8, item_y), item, fill=text_color, font=small_font)
            item_y += 15

    def draw_arrow(x1, y1, x2, y2, label="", style="solid"):
        """Draw an arrow between boxes"""
        color = hex_to_rgb(arrow_color)

        if style == "dashed":
            # Draw dashed line
            steps = 10
            for i in range(steps):
                if i % 2 == 0:
                    sx = x1 + (x2-x1) * i / steps
                    sy = y1 + (y2-y1) * i / steps
                    ex = x1 + (x2-x1) * (i+1) / steps
                    ey = y1 + (y2-y1) * (i+1) / steps
                    draw.line([(sx, sy), (ex, ey)], fill=color, width=1)
        else:
            draw.line([(x1, y1), (x2, y2)], fill=color, width=1)

        # Draw arrowhead
        import math
        angle = math.atan2(y2-y1, x2-x1)
        arrow_len = 8
        arrow_angle = math.pi / 6

        ax1 = x2 - arrow_len * math.cos(angle - arrow_angle)
        ay1 = y2 - arrow_len * math.sin(angle - arrow_angle)
        ax2 = x2 - arrow_len * math.cos(angle + arrow_angle)
        ay2 = y2 - arrow_len * math.sin(angle + arrow_angle)

        draw.polygon([(x2, y2), (ax1, ay1), (ax2, ay2)], fill=color)

        # Draw label
        if label:
            mid_x = (x1 + x2) / 2
            mid_y = (y1 + y2) / 2
            draw.text((mid_x, mid_y-10), label, fill=color, font=small_font, anchor="mm")

    # Title
    draw.text((width//2, 30), "Kiosk Management System - Architecture",
             fill=text_color, font=title_font, anchor="mm")

    # Layout positions
    y_start = 80
    box_width = 200
    box_height = 140
    spacing_x = 70
    spacing_y = 40

    # Row 1: Models (4 boxes)
    models = [
        ("Product", ["+ product_id", "+ name", "+ price", "+ available", "+ options[]"], model_color),
        ("Kiosk", ["+ kiosk_id", "+ location", "+ name", "+ status", "+ products[]"], model_color),
        ("Transaction", ["+ transaction_id", "+ kiosk_id", "+ items[]", "+ total_amount", "+ payment_status"], model_color),
        ("AdminStats", ["+ total_revenue", "+ total_transactions", "+ top_products", "+ kiosk_performance"], model_color),
    ]

    model_positions = []
    x = 50
    for name, items, color in models:
        draw_box(x, y_start, box_width, box_height, name, items, color, "Model")
        model_positions.append((x + box_width//2, y_start + box_height//2))
        x += box_width + spacing_x

    # Row 2: Services
    y_services = y_start + box_height + spacing_y + 40
    services = [
        ("FirebaseService", ["+ get_all_kiosks()", "+ create_kiosk()", "+ get_all_products()", "+ create_product()", "+ create_transaction()"], service_color),
        ("PaymentService", ["+ initialize_payment()", "+ confirm_payment()", "+ cancel_payment()", "+ refund_payment()"], service_color),
    ]

    service_positions = []
    x = 200
    for name, items, color in services:
        draw_box(x, y_services, box_width + 50, box_height, name, items, color, "Service")
        service_positions.append((x + (box_width+50)//2, y_services + box_height//2))
        x += box_width + 120

    # Row 3: Routers
    y_routers = y_services + box_height + spacing_y + 40
    routers = [
        ("KioskRouter", ["GET /kiosks", "POST /kiosks", "PUT /kiosks/{id}", "DELETE /kiosks/{id}"], router_color),
        ("ProductRouter", ["GET /products", "POST /products", "PUT /products/{id}"], router_color),
        ("TransactionRouter", ["POST /transactions", "POST /{id}/confirm", "POST /{id}/refund"], router_color),
        ("AdminRouter", ["GET /admin/stats", "GET /admin/revenue", "GET /admin/dashboard"], router_color),
    ]

    router_positions = []
    x = 50
    for name, items, color in routers:
        draw_box(x, y_routers, box_width, 100, name, items, color, "Router")
        router_positions.append((x + box_width//2, y_routers + 50))
        x += box_width + spacing_x

    # Main App (bottom center)
    y_app = y_routers + 100 + spacing_y + 20
    x_app = width // 2 - 150
    draw_box(x_app, y_app, 300, 80, "FastAPI Application",
             ["+ startup_event()", "+ include routers", "+ initialize services"],
             app_color, "Main")
    app_pos = (x_app + 150, y_app + 40)

    # Draw arrows (services -> models)
    draw_arrow(service_positions[0][0], service_positions[0][1] - 70,
               model_positions[1][0], model_positions[1][1] + 70, "manages", "dashed")
    draw_arrow(service_positions[0][0] + 40, service_positions[0][1] - 70,
               model_positions[2][0], model_positions[2][1] + 70, "manages", "dashed")

    # Draw arrows (routers -> services)
    draw_arrow(router_positions[0][0] + 80, router_positions[0][1] - 40,
               service_positions[0][0] - 80, service_positions[0][1] + 50, "uses", "dashed")
    draw_arrow(router_positions[2][0] + 50, router_positions[2][1] - 50,
               service_positions[1][0], service_positions[1][1] + 60, "uses", "dashed")

    # Draw arrows (app -> routers)
    for i, pos in enumerate(router_positions):
        draw_arrow(app_pos[0], app_pos[1] - 40, pos[0], pos[1] + 50, "", "solid")

    # Add legend
    legend_x = 50
    legend_y = height - 120
    draw.text((legend_x, legend_y), "Legend:", fill=text_color, font=header_font)

    legend_items = [
        ("Models: Data structures", model_color),
        ("Services: Business logic", service_color),
        ("Routers: API endpoints", router_color),
    ]

    legend_y += 25
    for text, color in legend_items:
        color_rgb = hex_to_rgb(color)
        draw.rectangle([legend_x, legend_y, legend_x+20, legend_y+15],
                      fill=color_rgb, outline=hex_to_rgb(border_color))
        draw.text((legend_x+30, legend_y+7), text, fill=text_color, font=small_font)
        legend_y += 25

    # Save the image
    output_path = 'class_diagram.png'
    img.save(output_path)
    print(f"✅ Class diagram generated successfully: {output_path}")
    return output_path

if __name__ == "__main__":
    create_simplified_diagram()
