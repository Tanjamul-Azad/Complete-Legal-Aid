import pymysql
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# Connect to MySQL server (without specifying a database)
connection = pymysql.connect(
    host=os.getenv('DB_HOST', 'localhost'),
    user=os.getenv('DB_USER', 'root'),
    password=os.getenv('DB_PASSWORD', 'root'),
    charset='utf8mb4'
)

try:
    with connection.cursor() as cursor:
        # Create database if it doesn't exist
        db_name = os.getenv('DB_NAME', 'complete_legal_aid')
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"Database '{db_name}' created successfully (or already exists)")
finally:
    connection.close()
