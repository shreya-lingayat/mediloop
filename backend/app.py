from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import uuid
import hashlib
import secrets
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

# =========================u
# 🔹 DB CONNECTION
# =========================
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="root",
        database="mediloop_db"
    )

# =========================
# 🔐 AUTH HELPERS
# =========================
def _hash(password: str, salt: str) -> str:
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest()

def _ensure_admin_exists():
    """On very first run, seed default admin/admin123 into AdminUser table."""
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    cur.execute("SELECT COUNT(*) as cnt FROM AdminUser")
    count = cur.fetchone()["cnt"]
    if count == 0:
        salt = secrets.token_hex(16)
        cur.execute(
            "INSERT INTO AdminUser VALUES (%s, %s, %s)",
            ("admin", _hash("admin123", salt), salt)
        )
        con.commit()
    cur.close()
    con.close()

def _verify_credentials(username: str, password: str) -> bool:
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    cur.execute("SELECT * FROM AdminUser WHERE username = %s", (username,))
    row = cur.fetchone()
    cur.close()
    con.close()
    if not row:
        return False
    return _hash(password, row["salt"]) == row["password_hash"]

# =========================
# 🔐 LOGIN
# =========================
@app.route('/login', methods=['POST'])
def login():
    try:
        _ensure_admin_exists()
        data = request.json or {}
        username = data.get("username", "").strip()
        password = data.get("password", "")

        if not username or not password:
            return jsonify({"error": "Username and password are required."}), 400

        if _verify_credentials(username, password):
            return jsonify({"message": "Login success"}), 200

        return jsonify({"error": "Invalid username or password."}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# 🔑 CHANGE PASSWORD
# =========================
@app.route('/change_password', methods=['POST'])
def change_password():
    try:
        data         = request.json or {}
        username     = data.get("username", "").strip()
        old_password = data.get("old_password", "")
        new_password = data.get("new_password", "")

        if not all([username, old_password, new_password]):
            return jsonify({"error": "All fields are required."}), 400

        if len(new_password) < 8:
            return jsonify({"error": "New password must be at least 8 characters."}), 400

        if not _verify_credentials(username, old_password):
            return jsonify({"error": "Current password is incorrect."}), 401

        salt     = secrets.token_hex(16)
        new_hash = _hash(new_password, salt)

        con = get_db_connection()
        cur = con.cursor()
        cur.execute(
            "UPDATE AdminUser SET password_hash=%s, salt=%s WHERE username=%s",
            (new_hash, salt, username)
        )
        con.commit()
        cur.close(); con.close()

        return jsonify({"message": "Password updated successfully."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# 👤 CHANGE USERNAME
# =========================
@app.route('/change_username', methods=['POST'])
def change_username():
    try:
        data         = request.json or {}
        username     = data.get("username", "").strip()
        password     = data.get("password", "")
        new_username = data.get("new_username", "").strip()

        if not all([username, password, new_username]):
            return jsonify({"error": "All fields are required."}), 400

        if not _verify_credentials(username, password):
            return jsonify({"error": "Password is incorrect."}), 401

        con = get_db_connection()
        cur = con.cursor(dictionary=True)

        cur.execute("SELECT username FROM AdminUser WHERE username=%s", (new_username,))
        if cur.fetchone():
            cur.close(); con.close()
            return jsonify({"error": "Username already taken."}), 409

        cur.execute(
            "UPDATE AdminUser SET username=%s WHERE username=%s",
            (new_username, username)
        )
        con.commit()
        cur.close(); con.close()

        return jsonify({"message": "Username updated successfully."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# 💊 MEDICINE MANAGEMENT
# =========================
@app.route('/add_medicine', methods=['POST'])
def add_medicine():
    try:
        data = request.json
        con = get_db_connection()
        cur = con.cursor()

        medicine_id = str(uuid.uuid4())[:8]

        cur.execute("""
            INSERT INTO Medicine 
            VALUES (%s,%s,%s,%s)
        """, (
            medicine_id,
            data["medicine_name"],
            data["category"],
            data["unit_price"]
        ))

        con.commit()
        return jsonify({"medicine_id": medicine_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); con.close()

@app.route('/get_medicines')
def get_medicines():
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    cur.execute("SELECT * FROM Medicine ORDER BY medicine_name")
    data = cur.fetchall()
    cur.close(); con.close()
    return jsonify(data)

# =========================
# 🏭 SUPPLIER MANAGEMENT
# =========================
@app.route('/add_supplier', methods=['POST'])
def add_supplier():
    try:
        data = request.json
        con = get_db_connection()
        cur = con.cursor()

        supplier_id = str(uuid.uuid4())[:8]

        cur.execute("""
            INSERT INTO Supplier 
            VALUES (%s,%s,%s,%s)
        """, (
            supplier_id,
            data["supplier_name"],
            data["contact_no"],
            data["license_no"]
        ))

        con.commit()
        return jsonify({"supplier_id": supplier_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); con.close()

@app.route('/get_suppliers')
def get_suppliers():
    con = get_db_connection()
    cur = con.cursor(dictionary=True)
    cur.execute("SELECT * FROM Supplier ORDER BY supplier_name")
    data = cur.fetchall()
    cur.close(); con.close()
    return jsonify(data)

# =========================
# 📦 BATCH MANAGEMENT
# =========================
@app.route('/add_batch', methods=['POST'])
def add_batch():
    try:
        data = request.json
        con = get_db_connection()
        cur = con.cursor()

        batch_id = str(uuid.uuid4())[:8]

        cur.execute("""
            INSERT INTO Batch 
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            batch_id,
            data["medicine_id"],
            data["supplier_id"],
            data["manufacturing_date"],
            data["quantity_available"],
            data["purchase_price"]
        ))

        con.commit()
        return jsonify({"batch_id": batch_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); con.close()

@app.route('/get_batch_details/<batch_id>')
def get_batch_details(batch_id):
    con = get_db_connection()
    cur = con.cursor(dictionary=True)

    cur.execute("""
        SELECT b.*, m.medicine_name, s.supplier_name 
        FROM Batch b
        JOIN Medicine m ON b.medicine_id = m.medicine_id
        JOIN Supplier s ON b.supplier_id = s.supplier_id
        WHERE b.batch_id = %s
    """, (batch_id,))

    data = cur.fetchone()
    cur.close(); con.close()

    if data:
        return jsonify(data)
    return jsonify({"error": "Batch not found"}), 404

# =========================
# 🧑 ADD PATIENT
# =========================
@app.route('/add_patient', methods=['POST'])
def add_patient():
    try:
        data = request.json
        con = get_db_connection()
        cur = con.cursor()

        patient_id = data["id"]

        cur.execute("""
            INSERT INTO Patient 
            VALUES (%s,%s,%s,%s,%s)
        """, (
            patient_id,
            data["name"],
            data["address"],
            data["contact"],
            datetime.now().date()
        ))

        con.commit()
        return jsonify({"patient_id": patient_id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close(); con.close()

# =========================
# 🔍 SEARCH PATIENT
# =========================
@app.route('/search_patient')
def search_patient():
    name = request.args.get("name")

    con = get_db_connection()
    cur = con.cursor(dictionary=True)

    cur.execute("""
        SELECT 
            p.patient_id,
            p.p_name,
            p.contact_no,
            p.registration_date,
            IFNULL(SUM(c.amount), 0) AS total_credits
        FROM Patient p
        LEFT JOIN Credit c 
            ON p.patient_id = c.patient_id 
            AND c.expiry_date >= CURDATE()
        WHERE p.p_name LIKE %s
        GROUP BY p.patient_id
        ORDER BY p.p_name
        LIMIT 5
    """, (f"%{name}%",))

    data = cur.fetchall()

    cur.close()
    con.close()

    return jsonify(data)

# =========================
# 💊 GET BATCH (FIFO)
# =========================
@app.route('/get_batches/<medicine_id>')
def get_batches(medicine_id):
    con = get_db_connection()
    cur = con.cursor(dictionary=True)

    cur.execute("""
        SELECT * FROM Batch 
        WHERE medicine_id=%s AND quantity_available>0
        ORDER BY manufacturing_date ASC
    """, (medicine_id,))

    data = cur.fetchall()
    cur.close(); con.close()
    return jsonify(data)

# =========================
# 🛒 CONFIRM SALE
# =========================
@app.route('/confirm_sale', methods=['POST'])
def confirm_sale():
    con = None
    cur = None

    try:
        data = request.json
        patient_id = data["patient_id"]
        cart = data["cart"]
        use_credits = data.get("use_credits", True)

        con = get_db_connection()
        cur = con.cursor(dictionary=True)

        # ✅ total bill
        total_amount = sum(item["sub_amount"] for item in cart)

        # ✅ GET TOTAL CREDITS (FIXED INDENTATION)
        cur.execute("""
            SELECT IFNULL(SUM(amount), 0) AS total_credits
            FROM Credit
            WHERE patient_id = %s AND expiry_date >= CURDATE()
        """, (patient_id,))
        result = cur.fetchone()
        credits = result["total_credits"] if result else 0

        # ✅ APPLY CREDITS
        credits_used = min(credits, total_amount) if use_credits else 0
        final_amount = total_amount - credits_used
        remaining_credits = credits - credits_used

        # ✅ CREATE TRANSACTION
        transaction_id = str(uuid.uuid4())[:8]

        cur.execute("""
            INSERT INTO Transaction_Table
            VALUES (%s, %s, %s, %s, %s)
        """, (transaction_id, patient_id, datetime.now().date(), final_amount, "DONE"))

        # ✅ PROCESS CART
        for item in cart:
            cur.execute(
                "SELECT quantity_available FROM Batch WHERE batch_id=%s",
                (item["batch_id"],)
            )
            stock = cur.fetchone()["quantity_available"]

            if stock < item["quantity"]:
                return jsonify({"error": "Stock low"}), 400

            cur.execute("""
                INSERT INTO Transaction_Item
                VALUES (%s, %s, %s, %s)
            """, (
                transaction_id,
                item["batch_id"],
                item["quantity"],
                item["sub_amount"]
            ))

            cur.execute("""
                UPDATE Batch
                SET quantity_available = quantity_available - %s
                WHERE batch_id = %s
            """, (item["quantity"], item["batch_id"]))

        # ✅ DEDUCT CREDITS (CORRECT WAY)
        if credits_used > 0:
            cur.execute("""
                INSERT INTO Credit (credit_id, patient_id, amount, issue_date, expiry_date)
                VALUES (%s, %s, %s, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY))
            """, (
                str(uuid.uuid4())[:8],
                patient_id,
                -credits_used   # negative entry = used credits
            ))

        con.commit()

        return jsonify({
            "transaction_id": transaction_id,
            "credits_used": credits_used,
            "remaining_credits": remaining_credits,
            "final_amount": final_amount
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cur:
            cur.close()
        if con:
            con.close()
# @app.route('/confirm_sale', methods=['POST'])
# def confirm_sale():
#     try:
#         data       = request.json
#         patient_id = data["patient_id"]
#         cart       = data["cart"]

#         con = get_db_connection()
#         cur = con.cursor()

#         transaction_id = str(uuid.uuid4())[:8]
#         total_amount   = sum(item["sub_amount"] for item in cart)

#         cur.execute("""
#             INSERT INTO Transaction_Table 
#             VALUES (%s,%s,%s,%s,%s)
#         """, (transaction_id, patient_id, datetime.now().date(), total_amount, "COMPLETED"))

#         for item in cart:
#             cur.execute("SELECT quantity_available FROM Batch WHERE batch_id=%s", (item["batch_id"],))
#             stock = cur.fetchone()[0]

#             if stock < item["quantity"]:
#                 return jsonify({"error": "Stock not enough"}), 400

#             cur.execute("""
#                 INSERT INTO Transaction_Item VALUES (%s,%s,%s,%s)
#             """, (transaction_id, item["batch_id"], item["quantity"], item["sub_amount"]))

#             cur.execute("""
#                 UPDATE Batch SET quantity_available = quantity_available - %s WHERE batch_id=%s
#             """, (item["quantity"], item["batch_id"]))

#         con.commit()
#         return jsonify({"transaction_id": transaction_id}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
#     finally:
#         cur.close(); con.close()

# =========================
# 💳 CREDIT SYSTEM and return 
# =========================

@app.route('/return_medicine', methods=['POST'])
def return_medicine():
    con = None
    cur = None

    try:
        data = request.json
        transaction_id = data["transaction_id"]
        batch_id = data["batch_id"]
        quantity = int(data["quantity"])

        con = get_db_connection()
        cur = con.cursor(dictionary=True)

        # 🔹 Get transaction + patient + item
        cur.execute("""
            SELECT 
                t.patient_id,
                t.transaction_date,
                ti.quantity,
                ti.sub_amount
            FROM Transaction_Table t
            JOIN Transaction_Item ti 
                ON t.transaction_id = ti.transaction_id
            WHERE t.transaction_id = %s AND ti.batch_id = %s
        """, (transaction_id, batch_id))

        tx = cur.fetchone()

        if not tx:
            return jsonify({"error": "Transaction not found"}), 404

        if quantity > tx["quantity"]:
            return jsonify({"error": "Return quantity exceeds purchased"}), 400

        # 🔹 Calculate days
        days = (datetime.now().date() - tx["transaction_date"]).days

        unit_price = tx["sub_amount"] / tx["quantity"]
        base_amount = quantity * unit_price

        # 🔥 CREDIT LOGIC
        if days <= 7:
            credit_amount = base_amount * 0.75
        elif days <= 15:
            credit_amount = base_amount * 0.25
        else:
            credit_amount = 0

        # 🔹 Save return
        return_id = str(uuid.uuid4())[:8]

        cur.execute("""
            INSERT INTO Return_Request
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (
            return_id,
            transaction_id,
            batch_id,
            quantity,
            "APPROVED",
            datetime.now().date()
        ))

        # 🔹 Add stock back
        cur.execute("""
            UPDATE Batch 
            SET quantity_available = quantity_available + %s
            WHERE batch_id = %s
        """, (quantity, batch_id))

        # 🔥 ADD CREDIT ENTRY
        if credit_amount > 0:
            cur.execute("""
                INSERT INTO Credit (credit_id, patient_id, amount, issue_date, expiry_date)
                VALUES (%s,%s,%s,CURDATE(),DATE_ADD(CURDATE(), INTERVAL 30 DAY))
            """, (
                str(uuid.uuid4())[:8],
                tx["patient_id"],
                credit_amount
            ))

        con.commit()

        return jsonify({
            "return_id": return_id,
            "credit_added": round(credit_amount, 2),
            "days": days
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        if cur: cur.close()
        if con: con.close()
# @app.route('/add_credit', methods=['POST'])
# def add_credit():
#     try:
#         data = request.json
#         con  = get_db_connection()
#         cur  = con.cursor()

#         credit_id = str(uuid.uuid4())[:8]

#         cur.execute("""
#             INSERT INTO Credit VALUES (%s,%s,%s,%s,%s)
#         """, (
#             credit_id,
#             data["patient_id"],
#             data["amount"],
#             datetime.now().date(),
#             datetime.now().date() + timedelta(days=30)
#         ))

#         con.commit()
#         return jsonify({"message": "Credit added"}), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
#     finally:
#         cur.close(); con.close()

# @app.route('/get_credit/<patient_id>')
# def get_credit(patient_id):
#     con = get_db_connection()
#     cur = con.cursor(dictionary=True)
#     cur.execute("SELECT * FROM Credit WHERE patient_id=%s", (patient_id,))
#     data = cur.fetchall()
#     cur.close(); con.close()
#     return jsonify(data)

# # =========================
# # 🔄 RETURN MEDICINE
# # =========================
# @app.route('/return_medicine', methods=['POST'])
# def return_medicine():
#     try:
#         data = request.json
#         con  = get_db_connection()
#         cur  = con.cursor(dictionary=True)

#         cur.execute("""
#             SELECT t.transaction_date, ti.sub_amount, ti.quantity 
#             FROM Transaction_Table t
#             JOIN Transaction_Item ti ON t.transaction_id = ti.transaction_id
#             WHERE t.transaction_id = %s AND ti.batch_id = %s
#         """, (data["transaction_id"], data["batch_id"]))

#         transaction_info = cur.fetchone()

#         if not transaction_info:
#             return jsonify({"error": "Transaction not found"}), 404

#         days_since = (datetime.now().date() - transaction_info["transaction_date"]).days
#         if days_since > 7:
#             return jsonify({"error": "Return window exceeded (7 days)"}), 400

#         if data["quantity"] > transaction_info["quantity"]:
#             return jsonify({"error": "Return quantity exceeds purchased quantity"}), 400

#         unit_price    = transaction_info["sub_amount"] / transaction_info["quantity"]
#         refund_amount = data["quantity"] * unit_price

#         if days_since > 3:
#             refund_amount *= 0.9

#         return_id = str(uuid.uuid4())[:8]

#         cur.execute("""
#             INSERT INTO Return_Request VALUES (%s,%s,%s,%s,%s,%s)
#         """, (return_id, data["transaction_id"], data["batch_id"], data["quantity"], "APPROVED", datetime.now().date()))

#         cur.execute("""
#             UPDATE Batch SET quantity_available = quantity_available + %s WHERE batch_id = %s
#         """, (data["quantity"], data["batch_id"]))

#         con.commit()
#         return jsonify({
#             "return_id":     return_id,
#             "refund_amount": refund_amount,
#             "message":       f"Return approved. Refund: ₹{refund_amount:.2f}"
#         }), 200

#     except Exception as e:
#         return jsonify({"error": str(e)}), 500
#     finally:
#         cur.close(); con.close()

# =========================
# 📊 PATIENT MEDICINE HISTORY
# =========================
@app.route('/patient_medicine_history/<patient_id>')
def patient_medicine_history(patient_id):
    try:
        con = get_db_connection()
        cur = con.cursor(dictionary=True)

        cur.execute("""
            SELECT 
                t.transaction_id,
                t.transaction_date,
                m.medicine_name,
                ti.quantity,
                ti.sub_amount,
                b.batch_id,

                -- ✅ SAFE division
                CASE 
                    WHEN ti.quantity > 0 
                    THEN (ti.sub_amount / ti.quantity) 
                    ELSE 0 
                END AS unit_price

            FROM Transaction_Table t
            JOIN Transaction_Item ti 
                ON t.transaction_id = ti.transaction_id
            JOIN Batch b 
                ON ti.batch_id = b.batch_id
            JOIN Medicine m 
                ON b.medicine_id = m.medicine_id

            WHERE t.patient_id = %s
            ORDER BY t.transaction_date DESC
        """, (patient_id,))

        data = cur.fetchall()

        return jsonify(data)

    except Exception as e:
        print("ERROR:", e)   # IMPORTANT
        return jsonify({"error": str(e)}), 500

    finally:
        cur.close()
        con.close()
# =========================
# 📈 DASHBOARD STATS
# =========================
@app.route('/dashboard_stats')
def dashboard_stats():
    con   = get_db_connection()
    cur   = con.cursor(dictionary=True)
    stats = {}

    cur.execute("SELECT COUNT(*) as count FROM Patient")
    stats['total_patients'] = cur.fetchone()['count']

    cur.execute("SELECT COUNT(*) as count FROM Medicine")
    stats['total_medicines'] = cur.fetchone()['count']

    cur.execute("SELECT COUNT(*) as count FROM Batch WHERE quantity_available < 10")
    stats['low_stock_items'] = cur.fetchone()['count']

    cur.execute("""
        SELECT COUNT(*) as count FROM Batch 
        WHERE DATE_ADD(manufacturing_date, INTERVAL 2 YEAR) <= CURDATE() + INTERVAL 30 DAY
    """)
    stats['expiring_soon'] = cur.fetchone()['count']

    cur.close(); con.close()
    return jsonify(stats)

# =========================
# ⚠️ EXPIRY ALERT
# =========================
@app.route('/expiry_alert')
def expiry_alert():
    con = get_db_connection()
    cur = con.cursor(dictionary=True)

    cur.execute("""
        SELECT b.*, m.medicine_name, s.supplier_name,
               DATEDIFF(DATE_ADD(b.manufacturing_date, INTERVAL 2 YEAR), CURDATE()) as days_to_expiry
        FROM Batch b
        JOIN Medicine m ON b.medicine_id = m.medicine_id
        JOIN Supplier s ON b.supplier_id = s.supplier_id
        WHERE DATE_ADD(b.manufacturing_date, INTERVAL 2 YEAR) <= CURDATE() + INTERVAL 30 DAY
        ORDER BY DATE_ADD(b.manufacturing_date, INTERVAL 2 YEAR) ASC
    """)

    data = cur.fetchall()
    cur.close(); con.close()
    return jsonify(data)

# =========================
# ▶ RUN
# =========================
if __name__ == '__main__':
    app.run(debug=True)  
    # update this withh all ui changed above