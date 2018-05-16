# polymer-form-wizard
This is sample implementation on how to work with routes, computed and observer to make a wizard on a single form component. 

The sample includes a cart array and each item in array is looped and displayed on the form. Once all items are looped, a review page is shown where the item can be deleted. There is a functionality that allows user to go back and forth by clicking browser back button. On deletion of item in cart, the back functionality is not affected and route in browser address bar adapts to the cart length.

At the review page, a sample payment request method is show to accept payments.

## Prerequisites
NodeJS is required to be installed on your system:
- Windows: https://nodejs.org/dist/v8.11.2/node-v8.11.2-x64.msi
- MacOS: https://nodejs.org/dist/v8.11.2/node-v8.11.2.pkg
- Linux(Debian): https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions

## Installation
Please follow the instruction below:
```
npm install -g polymer-cli
```
```
git clone https://github.com/grvsooryen/polymer-form-wizard.git
```
```
cd polymer-form-wizard
```
```
npm install && bower install && polymer serve
```