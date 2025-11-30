import pymysql

# Connect to MySQL server (without specifying a database)
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='12345678',
    charset='utf8mb4'
)

try:
    with connection.cursor() as cursor:
        # Create database if it doesn't exist
        cursor.execute("CREATE DATABASE IF NOT EXISTS complete_legal_aid CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print("Database 'complete_legal_aid' created successfully (or already exists)")
finally:
    connection.close()
