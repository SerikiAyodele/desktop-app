const electron = require('electron');
const url = require('url'); //bringing in the core module
const path = require('path'); //bringing in the path 



//grabbing suff from electron and using a bit of destructoring
const {app, BrowserWindow, Menu, ipcMain} = electron;

//SET ENV
process.env.NODE_ENV = 'production';

//variable representing our main window which will list all our items
let mainWindow;
let addWindow;

//listen for the app to be ready
app.on('ready', function(){ 
    //create new window
    mainWindow=new BrowserWindow({
        webPreferences: {
            nodeIntegration: true 
        }
    });
    //Load html into window
    mainWindow.loadURL(url.format({
        // basically what the following code is going to do, is load the html file into the url
       pathname: path.join(__dirname, 'mainWindow.html'),
       protocol:'file',
       slashes: true,
      
    }));

    //Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    })

    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu);
});

//Hndle the creation of the addWindow function
function createAddWindow(){
     //create new window
     addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title:'Add Shopping List Items',
        webPreferences: {nodeIntegration: true}
       
        
     });
     //Load html into window
     addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addWindow.html'),
        protocol:'file',
        slashes: true
     }));
     //garbage collector
     addWindow.on('close', function(){
         addWindow = null;
     })
}

//catch item:add
ipcMain.on('item:add', function(e, item){
    //sending to the main window
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
})

//creating menu template
//a menu in elctron is an array of objects
const mainMenuTemplate = [
    {
        label: 'File',
        submenu:[{
            label:'Add Item',
            click(){
                createAddWindow(); 
            }
        },
        {
            label: 'Clear Items',
            click(){
                mainWindow.webContents.send('item:clear');
            }
        },
        {
            label:'Quit', 
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click(){
                app.quit();
            }
        }
    ]
    }
]

// if mac, add empty object to menu
if(process.platform == 'darwin'){
    mainMenuTemplate.unshift({});
}

//Add developer tools item if not in production
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
      label: 'Developer Tools',
      submenu: [{
        label:'Toggle DevTools',
        accelerator: process.platform =="darwin" ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
            focusedWindow.toggleDevTools();
         }
        },
        {
            role: 'reload'
        }]
  })
}