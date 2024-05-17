<div align="center">
  
# Bot Status To Discord Webhook

**A simple script to ping your bots (or any other service) and send their statuses to webhooks.**

</div>


# Usage

1. Install **node.js**
2. Install dependencies using ```npm install```
3. Make sure your bot is running a web app <ins>**that you can ping**</ins> (e. g. using express. _This also works with localhost, however in that case your bot and this script should be running on the same machine_)
4. Modify webhook and bot lists in ```pingState.js```
5. Run using ```node .``` or ```node pingState.js``` 