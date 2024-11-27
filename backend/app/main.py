from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from utils.logger import logging_middleware, logger

app = FastAPI(title = "SolarRev - Solar Revenue Estimation")

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:3000"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

# Add logging middleware 
app.middleware("http")(logging_middleware)