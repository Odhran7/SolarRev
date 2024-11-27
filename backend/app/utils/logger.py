import logging
import sys
from pathlib import Path
from loguru import logger
import json
from datetime import datetime
from fastapi import Request
from typing import Callable
from time import time

LOGS_DIR = Path("logs")
LOGS_DIR.mkdir(exist_ok = True)

config = {
    "handlers": [
        {
            "sink": sys.stdout,
            "format": "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
        },
        {
            "sink": LOGS_DIR / "app.log",
            "format": "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            "rotation": "500 MB",
            "retention": "10 days",
            "compression": "zip",
        },
        {
            "sink": LOGS_DIR / "errors.log",
            "format": "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}",
            "level": "ERROR",
            "rotation": "100 MB",
            "retention": "10 days",
            "compression": "zip",
        }
    ],
}

logger.configure(**config)

# Create middleware function

async def logging_middleware(request: Request, call_next: Callable):
    start_time = time()
    
    body = None
    
    if request.method in ["Post", "PUT"]:
        try:
            body = await request.json()
        except:
            body = await request.body()
    
        request_log = {
        "timestamp": datetime.now().isoformat(),
        "method": request.method,
        "path": request.url.path,
        "query_params": str(request.query_params),
        "body": body,
        "client_host": request.client.host if request.client else None,
    }
    
    logger.info(f"Request: {json.dumps(request_log, default=str)}")
    try:
        response = await call_next(request)
        process_time = time() - start_time
        logger.info(
            f"Response: Status {response.status_code}, Process Time: {process_time:.3f}s"
        )
        return response
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        raise