@echo off
setlocal
set "ROOT=%~dp0"
node "%ROOT%adapters\openai-product-agent\run.mjs" %*
