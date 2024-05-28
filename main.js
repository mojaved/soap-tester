const express = require("express");
const soap = require("soap");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const url = "http://example.com/wsdl?wsdl";

const username = 'your-username';
const password = 'your-password';

app.post("/call-soap-api", (req, res) => {
  const args = {
    AccountTransaction: {
      TransactionId: "NDI3NzM%3D",
      TransactionAmount: 100,
      TransactionDate: "16-MAY-24",
      CreditCardAuthorizationDetails: {
        CardType: 1,
        AuthorizationNumber: 100,
        MerchantID: 0,
      },
      VendorReferenceId: "SC2-90339",
    },
  };

  const options = {
    wsdl_headers: {
      Authorization:
        "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
    },
    wsdl_options: {
      rejectUnauthorized: false,
    },
  };

  soap.createClient(url, options, (err, client) => {
    if (err) {
      console.log(`ERROR 1: ${err}`);
      return res
        .status(500)
        .json({ error: "Failed to create SOAP client", details: err });
    }

    client.setSecurity(new soap.BasicAuthSecurity(username, password));

    client.on("request", (xml) => {
      console.log("SOAP Request XML:", xml);
    });

    client.on("response", (xml) => {
      console.log("SOAP Response XML:", xml);
    });

    client.AddAccountTransaction(
      args,
      (err, response, rawResponse, soapHeader, rawRequest) => {
        if (err) {
          console.log(`ERROR 2: ${err}`);
          return res
            .status(500)
            .json({ error: "SOAP method call failed", details: err });
        }

        console.log("RAW SOAP Request:", rawRequest);
        console.log("SOAP Headers:", soapHeader);
        console.log("RAW SOAP Response:", rawResponse);
        console.log("Result:", response);

        res.json({
          Error: err,
          Result: response ? response : null,
          RawRequest: rawRequest,
          SoapHeader: soapHeader,
          RawResponse: rawResponse,
        });
      }
    );
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
