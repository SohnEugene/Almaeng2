#!/usr/bin/env python3
"""
Generate class diagram for the Kiosk Management System
"""

try:
    from graphviz import Digraph
except ImportError:
    print("Installing graphviz package...")
    import subprocess
    subprocess.check_call(["pip", "install", "graphviz"])
    from graphviz import Digraph

def create_class_diagram():
    """Create and save the class diagram"""
    dot = Digraph(comment='Kiosk Management System Class Diagram')
    dot.attr(rankdir='TB', bgcolor='white', splines='ortho')
    dot.attr('node', shape='record', style='filled', fontname='Arial')
    dot.attr('edge', fontname='Arial', fontsize='10')

    # Models Package
    with dot.subgraph(name='cluster_models') as c:
        c.attr(label='Models (Pydantic)', style='filled', color='lightblue')

        c.node('ProductOption',
               '<<Model>>\\nProductOption|'
               '+ name: str\\l'
               '+ value: str\\l'
               '+ price_modifier: float\\l',
               fillcolor='#E3F2FD')

        c.node('Product',
               '<<Model>>\\nProduct|'
               '+ product_id: str\\l'
               '+ name: str\\l'
               '+ price: float\\l'
               '+ description: Optional[str]\\l'
               '+ category: Optional[str]\\l'
               '+ available: bool\\l'
               '+ options: List[ProductOption]\\l',
               fillcolor='#E3F2FD')

        c.node('Kiosk',
               '<<Model>>\\nKiosk|'
               '+ kiosk_id: str\\l'
               '+ location: str\\l'
               '+ name: str\\l'
               '+ status: str\\l'
               '+ products: List[str]\\l'
               '+ created_at: datetime\\l'
               '+ updated_at: datetime\\l',
               fillcolor='#E3F2FD')

        c.node('TransactionItem',
               '<<Model>>\\nTransactionItem|'
               '+ product_id: str\\l'
               '+ product_name: str\\l'
               '+ quantity: int\\l'
               '+ unit_price: float\\l'
               '+ subtotal: float\\l',
               fillcolor='#E3F2FD')

        c.node('Transaction',
               '<<Model>>\\nTransaction|'
               '+ transaction_id: str\\l'
               '+ kiosk_id: str\\l'
               '+ items: List[TransactionItem]\\l'
               '+ total_amount: float\\l'
               '+ payment_method: str\\l'
               '+ payment_status: str\\l'
               '+ timestamp: datetime\\l'
               '+ receipt_number: str\\l',
               fillcolor='#E3F2FD')

        c.node('AdminStats',
               '<<Model>>\\nAdminStats|'
               '+ total_kiosks: int\\l'
               '+ total_products: int\\l'
               '+ total_transactions: int\\l'
               '+ total_revenue: float\\l'
               '+ top_products: List[Dict]\\l',
               fillcolor='#E3F2FD')

    # Services Package
    with dot.subgraph(name='cluster_services') as c:
        c.attr(label='Services', style='filled', color='lightgreen')

        c.node('FirebaseService',
               '<<Service>>\\nFirebaseService|'
               '- db: Firestore\\l|'
               '+ initialize()\\l'
               '+ get_all_kiosks()\\l'
               '+ get_kiosk_by_id()\\l'
               '+ create_kiosk()\\l'
               '+ update_kiosk()\\l'
               '+ get_all_products()\\l'
               '+ create_product()\\l'
               '+ get_all_transactions()\\l'
               '+ create_transaction()\\l',
               fillcolor='#C8E6C9')

        c.node('PaymentService',
               '<<Service>>\\nPaymentService|'
               '- api_key: str\\l'
               '- api_secret: str\\l|'
               '+ initialize_payment()\\l'
               '+ confirm_payment()\\l'
               '+ cancel_payment()\\l'
               '+ refund_payment()\\l'
               '+ get_payment_status()\\l',
               fillcolor='#C8E6C9')

    # Routes Package
    with dot.subgraph(name='cluster_routes') as c:
        c.attr(label='Routes (FastAPI)', style='filled', color='lightyellow')

        c.node('KioskRouter',
               '<<Router>>\\nKioskRouter|'
               '+ GET /kiosks\\l'
               '+ GET /kiosks/{id}\\l'
               '+ POST /kiosks\\l'
               '+ PUT /kiosks/{id}\\l'
               '+ DELETE /kiosks/{id}\\l',
               fillcolor='#FFF9C4')

        c.node('ProductRouter',
               '<<Router>>\\nProductRouter|'
               '+ GET /products\\l'
               '+ GET /products/{id}\\l'
               '+ POST /products\\l'
               '+ PUT /products/{id}\\l'
               '+ DELETE /products/{id}\\l',
               fillcolor='#FFF9C4')

        c.node('TransactionRouter',
               '<<Router>>\\nTransactionRouter|'
               '+ GET /transactions\\l'
               '+ POST /transactions\\l'
               '+ POST /{id}/confirm\\l'
               '+ POST /{id}/cancel\\l'
               '+ POST /{id}/refund\\l',
               fillcolor='#FFF9C4')

        c.node('AdminRouter',
               '<<Router>>\\nAdminRouter|'
               '+ GET /admin/stats\\l'
               '+ GET /admin/revenue\\l'
               '+ GET /admin/dashboard\\l',
               fillcolor='#FFF9C4')

    # Utilities
    with dot.subgraph(name='cluster_utils') as c:
        c.attr(label='Utilities', style='filled', color='lightpink')

        c.node('Helpers',
               '<<Util>>\\nHelpers|'
               '+ generate_unique_id()\\l'
               '+ generate_receipt_number()\\l'
               '+ format_datetime()\\l'
               '+ calculate_total()\\l'
               '+ validate_payment_method()\\l'
               '+ format_currency()\\l',
               fillcolor='#F8BBD0')

    # Main App
    dot.node('FastAPIApp',
             'FastAPIApp|'
             '+ app: FastAPI\\l|'
             '+ startup_event()\\l'
             '+ shutdown_event()\\l'
             '+ root()\\l'
             '+ health_check()\\l',
             fillcolor='#FFCCBC')

    # Model Relationships
    dot.edge('Product', 'ProductOption', label='contains', style='dashed', arrowhead='diamond')
    dot.edge('Transaction', 'TransactionItem', label='contains', style='dashed', arrowhead='diamond')
    dot.edge('Transaction', 'Kiosk', label='at location', style='dashed')

    # Service -> Model relationships
    dot.edge('FirebaseService', 'Kiosk', label='manages', style='dotted', color='darkgreen')
    dot.edge('FirebaseService', 'Product', label='manages', style='dotted', color='darkgreen')
    dot.edge('FirebaseService', 'Transaction', label='manages', style='dotted', color='darkgreen')
    dot.edge('PaymentService', 'Transaction', label='processes', style='dotted', color='darkgreen')

    # Router -> Service relationships
    dot.edge('KioskRouter', 'FirebaseService', label='uses', style='dashed', color='blue')
    dot.edge('ProductRouter', 'FirebaseService', label='uses', style='dashed', color='blue')
    dot.edge('TransactionRouter', 'FirebaseService', label='uses', style='dashed', color='blue')
    dot.edge('TransactionRouter', 'PaymentService', label='uses', style='dashed', color='blue')
    dot.edge('AdminRouter', 'FirebaseService', label='uses', style='dashed', color='blue')

    # Router -> Model relationships (returns)
    dot.edge('KioskRouter', 'Kiosk', label='returns', style='dotted', color='purple')
    dot.edge('ProductRouter', 'Product', label='returns', style='dotted', color='purple')
    dot.edge('TransactionRouter', 'Transaction', label='returns', style='dotted', color='purple')
    dot.edge('AdminRouter', 'AdminStats', label='returns', style='dotted', color='purple')

    # Main App relationships
    dot.edge('FastAPIApp', 'KioskRouter', label='includes', style='solid', color='red')
    dot.edge('FastAPIApp', 'ProductRouter', label='includes', style='solid', color='red')
    dot.edge('FastAPIApp', 'TransactionRouter', label='includes', style='solid', color='red')
    dot.edge('FastAPIApp', 'AdminRouter', label='includes', style='solid', color='red')
    dot.edge('FastAPIApp', 'FirebaseService', label='initializes', style='solid', color='red')

    # Render the diagram
    try:
        output_path = dot.render('class_diagram', format='png', cleanup=True)
        print(f"✅ Class diagram generated successfully: {output_path}")
        return output_path
    except Exception as e:
        # If graphviz executable is not installed, save as DOT file
        dot.save('class_diagram.dot')
        print(f"⚠️  Graphviz executable not found. DOT file saved as 'class_diagram.dot'")
        print(f"Error: {e}")
        print("\nTo generate PNG, install Graphviz:")
        print("  macOS: brew install graphviz")
        print("  Ubuntu: sudo apt-get install graphviz")
        print("  Then run: dot -Tpng class_diagram.dot -o class_diagram.png")
        return None

if __name__ == "__main__":
    create_class_diagram()
