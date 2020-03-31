'use strict';

const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var snake;
var ai;

function createSnakeWindow()
{
	snake = new BrowserWindow({width: 500, height: 500});

	snake.loadURL("file://" + __dirname + "/Snake/Snake.html");

	snake.on('closed', function()
	{
		snake = null;
	});
}

function createAIWindow()
{
	//ai = new BrowserWindow({width: 500, height: 500});

	//ai.loadURL("file://" + __dirname + "/index.html");

	//ai.on('closed', function()
	//{
	//	ai = null;
	//});
}

app.on('window-all-closed', function()
{
	if (process.platform !== 'darwin')
		app.quit();
});

app.on('activate', function()
{
	if (snake === null)
		createSnakeWindow();
	if (ai === null)
		createAIWindow();
});

app.on('ready', function()
{
	createSnakeWindow();
});