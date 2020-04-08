# Purple News
## About the App
Purple News is a website that scrapes popular news sites and pairs politically polarized news articles of the same topic to give readers the ability to both visualize the bias in their news as well as view media coverage from every perspective.

## Installation
### Clone
Clone this repo to your local machine using https://github.com/olsencar/NewsAggregator.git
### Setup
1) Navigate to the `/web_app` directory. 
2) Install the required npm packages.
```javascript
  npm install
```
3) Navigate to the `/web_app/client` directory.
4) Repeat the npm package installation.
```javascript
  npm install
```
5) You must have the following environment variables set to valid credentials:
  - ```MONGO_USERNAME```
  - ```MONGO_PASSWORD```

## Usage
To run Purple News:
1) Navigate to the `/web_app` directory. 
2) Input the following command to start the server and launch a client on local host port 3000.
```javascript
npm run dev
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.
