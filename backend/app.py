
from fastapi import FastAPI, HTTPException, Request, Body
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client
from dotenv import load_dotenv
import os
import razorpay

# -------------------------------
# LOAD ENV VARIABLES
# -------------------------------

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RAZORPAY_SECRET = os.getenv("RAZORPAY_SECRET")
client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET))

if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception("Missing Supabase credentials")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

razorpay_client = razorpay.Client(
    auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET)
)

# -------------------------------
# FASTAPI APP
# -------------------------------

app = FastAPI(title="OFFICE INVENTORY MANAGEMENT API")
origins = [
    "https://jaswinzz-team-project-nithish-hrithik-qg3il6ncx.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://jaswinzz-team-project-nithish-hrithik-qg3il6ncx.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# ROOT / HEALTH CHECK
# -------------------------------

@app.get("/")
def root():
    return {"status": "Asset Harmony Backend Running"}

@app.get("/health")
def health():
    return {"status": "OK"}

# -------------------------------
# ASSETS
# -------------------------------

@app.get("/assets")
def get_assets():
    res = supabase.table("assets").select("*").execute()
    return res.data


@app.post("/assets")
def create_asset(asset: dict):
    res = supabase.table("assets").insert(asset).execute()
    return res.data

@app.get("/reorders")
def create_reorder():
    res = supabase.table("reorder_requests").select("*").execute()
    return res.data

@app.post("/reorders")
def create_reorder(req = Body(...)):

    rows = []

    if isinstance(req, list):
        for r in req:
            rows.append({
                "asset_id": r.get("asset_id"),
                "estimated_cost": r.get("estimated_cost"),
                "notes": r.get("notes"),
                "requested_quantity": 1,
                "status": "pending"
            })
    else:
        rows.append({
            "asset_id": req.get("asset_id"),
            "estimated_cost": req.get("estimated_cost"),
            "notes": req.get("notes"),
            "requested_quantity": 1,
            "status": "pending"
        })

    res = supabase.table("reorder_requests").insert(rows).execute()

    return res.data

@app.put("/assets/{asset_id}")
def update_asset(asset_id: str, asset: dict):
    res = supabase.table("assets").update(asset).eq("id", asset_id).execute()
    return res.data


@app.delete("/assets/{asset_id}")
def delete_asset(asset_id: str):
    res = supabase.table("assets").delete().eq("id", asset_id).execute()
    return res.data


# -------------------------------
# PRODUCTS
# -------------------------------

@app.get("/products")
def get_products():
    res = supabase.table("products").select("*").execute()
    return res.data


@app.post("/products")
def create_product(product: dict):
    res = supabase.table("products").insert(product).execute()
    return res.data


@app.put("/products/{product_id}")
def update_product(product_id: str, product: dict):
    res = supabase.table("products").update(product).eq("id", product_id).execute()
    return res.data


@app.delete("/products/{product_id}")
def delete_product(product_id: str):
    res = supabase.table("products").delete().eq("id", product_id).execute()
    return res.data


# -------------------------------
# LOW STOCK PRODUCTS
# -------------------------------

@app.get("/products/low-stock")
def low_stock_products():

    res = supabase.table("products").select("*").execute()

    low_stock = [
        p for p in res.data
        if p["quantity"] <= p["reorder_point"]
    ]

    return low_stock


# -------------------------------
# SALES
# -------------------------------

@app.get("/sales")
def get_sales():

    res = supabase.table("sales").select(
        "*, products(name, sku, category)"
    ).order("created_at", desc=True).execute()

    return res.data


@app.post("/sales")
def create_sale(sale: dict):

    product_id = sale["product_id"]
    quantity = sale["quantity"]

    product = supabase.table("products") \
        .select("quantity") \
        .eq("id", product_id) \
        .single() \
        .execute()

    if not product.data:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.data["quantity"] < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    # deduct stock
    new_qty = product.data["quantity"] - quantity

    supabase.table("products") \
        .update({"quantity": new_qty}) \
        .eq("id", product_id) \
        .execute()

    res = supabase.table("sales").insert(sale).execute()

    return res.data


# -------------------------------
# SALES ANALYTICS
# -------------------------------

@app.get("/sales/analytics")
def sales_analytics():

    res = supabase.table("sales").select("*").execute()

    sales = res.data

    total_revenue = sum(s["total_price"] for s in sales)
    total_sales = len(sales)

    return {
        "total_revenue": total_revenue,
        "total_sales": total_sales
    }


# -------------------------------
# REORDER REQUESTS
# -------------------------------

@app.get("/reorders")
def get_reorders():

    res = supabase.table("reorder_requests").select(
        "*, products(name, sku)"
    ).execute()

    return res.data


@app.post("/reorders")
def create_reorder(req: dict):

    res = supabase.table("reorder_requests").insert(req).execute()

    return res.data


# -------------------------------
# AUDIT LOGS
# -------------------------------

@app.get("/audit-logs")
def get_audit_logs():

    res = supabase.table("audit_logs").select(
        "*, profiles:auditor_id(full_name), assets:asset_id(name, asset_id)"
    ).order("created_at", desc=True).limit(200).execute()

    return res.data


@app.post("/audit-logs")
def create_audit_log(log: dict):

    res = supabase.table("audit_logs").insert(log).execute()

    return res.data


# -------------------------------
# BULK DEMO PRODUCTS
# -------------------------------

@app.post("/products/demo")
def insert_demo_products():

    demo = []

    for i in range(1, 101):
        demo.append({
            "sku": f"SKU-{i}",
            "name": f"Product {i}",
            "category": "General",
            "description": f"Demo product {i}",
            "price": 100 + i,
            "quantity": 50,
            "reorder_point": 10,
            "location": "Warehouse"
        })

    res = supabase.table("products").insert(demo).execute()

    return {"inserted": len(res.data)}


# -------------------------------
# RAZORPAY PAYMENT
# -------------------------------
from pydantic import BaseModel

class OrderRequest(BaseModel):
    amount: int
@app.post("/create-order")
async def create_order(order: OrderRequest):

    order_data = razorpay_client.order.create({
        "amount": order.amount * 100,
        "currency": "INR",
        "payment_capture": 1
    })

    return {
        "order_id": order_data["id"],
        "amount": order.amount,
        "key": RAZORPAY_KEY_ID
    }


@app.post("/verify-payment")
async def verify_payment(data: dict):

    try:

        client.utility.verify_payment_signature({
            "razorpay_order_id": data["razorpay_order_id"],
            "razorpay_payment_id": data["razorpay_payment_id"],
            "razorpay_signature": data["razorpay_signature"]
        })

        return {"status": "success"}
        print(data)

    except razorpay.errors.SignatureVerificationError:

        return {"status": "failed"}

@app.post("/sales")
async def create_sale(data: dict):

    quantity = int(data["quantity"])
    unit_price = float(data["unitPrice"])

    sale = {
        "product_id": data["productId"],
        "quantity": quantity,
        "unit_price": unit_price,
        "total_price": quantity * unit_price,
        "sold_by": data.get("soldBy"),
        "customer_name": data.get("customerName"),
        "notes": data.get("notes")
    }

    # insert sale
    supabase.table("sales").insert(sale).execute()

    # update product quantity
    product = supabase.table("products")\
        .select("quantity")\
        .eq("id", data["productId"])\
        .single()\
        .execute()

    new_quantity = product.data["quantity"] - quantity

    supabase.table("products")\
        .update({"quantity": new_quantity})\
        .eq("id", data["productId"])\
        .execute()

    return {"status": "success"}

@app.post("/products/delete-bulk")
def delete_products(data: dict):

    ids = data["ids"]

    res = supabase.table("products").delete().in_("id", ids).execute()

    return {"deleted": res.data}


@app.get("/activity-logs")
def get_activity_logs():
    try:
        res = supabase.table("audit_logs").select(
            "*, profiles(full_name), assets(name, asset_id)"
        ).order("created_at", desc=True).limit(50).execute()

        return res.data

    except Exception as e:
        return {"error": str(e)}