import Fs from 'fs';
import Colors from 'colors';
import Glob from 'glob-array';

import StylusVespa from './stylus.server.model.js';
import Server from './server.js';
import Routes from './routes.js';
import Db from './db.js';
import Crud from './crud.server.model.js';
import Utils from './utils.server.model.js';

// const compileStylusMiddleware = StylusVespa.compileMiddleware;

class Framework {
  
  static test() {
    console.log('Works!');
  }

  static install() {
    this.createDirectories();
    this.updatePackageJsonOptions();
    this.installMustHaveFiles();
    this.setupEnvFile();
    this.writeGitKeepFile();
    this.writeGitIgnore();
  }
  
  static init() {
    this.setupEnvFile();
    this.loadEnvFile();
    this.createDirectories();
    this.setGlobalsVariables();
    StylusVespa.compileStylus();
  }
  
  static setGlobalsVariables() {
    let rootDirectory = process.cwd();
    global.BASE_PATH = rootDirectory.replace('/framework/framework.js', '');
    global.CLIENT_PATH = global.BASE_PATH + '/client';
    global.SERVER_PATH = global.BASE_PATH + '/server';
    global.VIEWS_PATH = global.BASE_PATH + '/client/views';
    global.PUBLIC_PATH = global.BASE_PATH + '/public';

    console.log('Global variables:');
    console.log(`global.BASE_PATH: ${global.BASE_PATH}`);
    console.log(`global.CLIENT_PATH: ${global.CLIENT_PATH}`);
    console.log(`global.SERVER_PATH: ${global.SERVER_PATH}`);
    console.log(`global.VIEWS_PATH: ${global.VIEWS_PATH}`);
    console.log(`global.PUBLIC_PATH: ${global.PUBLIC_PATH}`);
    console.log('---------------------------------------------------------');
    console.log('');
  }

  static loadEnvFile() {
    // Load file .env in Dev environmet
    if(!process.env.NODE_ENV) {
      process.loadEnvFile();
    }
  }
  
  static compileJs() {
    const BASE_PATH = process.cwd();
    const WATCH_PATH = `${process.cwd()}/client/js`;
    const PUBLIC_PATH = `${BASE_PATH}/public/js`;
    this.copyFolder(WATCH_PATH, PUBLIC_PATH);
  }

  static compileMedia() {
    let src = `${global.CLIENT_PATH}/media`;
    let dest = `${global.PUBLIC_PATH}/media`;
    Fs.cpSync(src, dest, {recursive: true});
    console.log(Colors.grey('copyed ') + `${src} ➞ ${dest}/${dest}`);
  }
  
  static createDirectories() {
    const FILE_TEMPLATE_PATH = this.getRelativeDirectory();
    let tree = [
      'client/media',
      'client/js',
      'client/styles',
      'client/views',
      'coverage',
      'fixtures',
      'public/css',
      'public/js',
      'public/media',
      'reports',
      'scripts',
      'server/models',
      'server/controllers',
      'server/middlewares',
      'test',
    ];
    for (var i = 0; i < tree.length; i++) {
      if(!Fs.existsSync(tree[i])) {
        Fs.mkdirSync(tree[i], { recursive: true });
        console.log(Colors.yellow('✓') + ` Folder ${tree[i]} was created`);
      }
    }
    console.log(Colors.green('✓') + ' Structure folder checked');
  }

  static installMustHaveFiles() {
    const FILE_TEMPLATE_PATH = this.getRelativeDirectory();
    let files = [
      'app.js',
      '.editorconfig',
      'readme.md',
      'server/models/routes.server.model.js',
      'server/controllers/example.server.controller.js',
      'server/middlewares/example.server.middleware.js'
    ];
    for (var i = 0; i < files.length; i++) {
      if(!Fs.existsSync(files[i])) {
        Fs.copyFileSync(`${FILE_TEMPLATE_PATH}/${files[i]}`, files[i], Fs.constants.COPYFILE_EXCL);
        console.log(Colors.green('✓') + ` COPYED ${files[i]}`);
      }
    }
  }

  static watchJs() {
    const BASE_PATH = process.cwd();
    const WATCH_PATH = `${process.cwd()}/client/js`;
    const PUBLIC_PATH = `${BASE_PATH}/public/js`;
    Fs.watch(WATCH_PATH, (eventType, filename) => {
      console.log(`>>>> ${eventType} on ${filename}`);
      this.copyFolder(WATCH_PATH, PUBLIC_PATH);
    });
  }

  static copyFolder(src, dest) {
    Fs.cpSync(src, dest, {recursive: true});
    console.log(Colors.grey('compiled ') + `${src} ➞ ${dest}`);
  }

  // static uglifyJs(input, output) {
  //   // Uglify vendor
  //   var allCodeStringVendor = '';
  //   var uglified = null;

  //   input.forEach((file, i) => {
  //     allCodeStringVendor += fs.readFileSync(file, "utf8");
  //   });

  //   uglified = UglifyJS.minify(allCodeStringVendor).code;
    
  //   fs.writeFile(output, uglified, function (err) {
  //     if (err) return console.log(err);
  //     console.log('Compiled:  See the output at ' + output);
  //   });
  // }; // uglifyJs()
  
  static setupEnvFile() {

    if (process.env.NODE_ENV === 'production') {
      return;
    }
    return new Promise( (resolve, reject) => {

      const FILE_TEMPLATE_PATH = this.getRelativeDirectory();
      
      // Check if the file exists in the current directory.
      if(!Fs.existsSync(`${process.cwd()}/.env`)) {
        Fs.copyFileSync(`${FILE_TEMPLATE_PATH}/.env-template`, '.env', Fs.constants.COPYFILE_EXCL);
        console.log(Colors.green('✓') + ' CHECK THE .env DEFAULTS OPTIONS', Colors.yellow('<==============='));
      }

      // Check if the file exists in the current directory.
      if(!Fs.existsSync(`${process.cwd()}/.env-production`)) {
        Fs.copyFileSync(`${FILE_TEMPLATE_PATH}/.env-production`, '.env-production', Fs.constants.COPYFILE_EXCL);
        console.log(Colors.green('✓') + ' CHECK THE .env-production DEFAULTS OPTIONS', Colors.yellow('<==============='));
      }
    });

  } //createEnvFile()

  static writeGitKeepFile() {
    const FILE_TEMPLATE_PATH = this.getRelativeDirectory();
    let files = [
      'client/styles',
      'client/views',
      'coverage',
      'fixtures',
      'public/css',
      'public/js',
      'public/media',
      'reports',
      'scripts',
      'server/controllers',
      'server/middlewares',
      'server/models',
      'test',
    ];
    for (var i = 0; i < files.length; i++) {
      Fs.writeFileSync(`${files[i]}/.gitkeep`, '');
      console.log(Colors.green('✓') + ` Created ${files[i]}/.gitkeep`);
    }
  }

  static writeGitIgnore() {
    let content = `node_modules
mongod.bat
coverage
reports/**/*
public/**/*
!**/*.gitkeep
!public/media/favicon.ico
*.log
*.DS_Store`;
    Fs.writeFileSync(`.gitignore`, content);
    console.log(Colors.green('✓') + ` Created .gitignore`);
  }

  static updatePackageJsonOptions() {
    const vespaConfig = {
      type: 'module',
      main: 'app.js',
      scripts: {
        start: 'node app.js',
        debug: 'node --inspect-brk app.js',
        staging: 'node --env-file=.env-production app.js',
        build: 'node node_modules/vespa-framework/src/build.js',
        // prod: 'heroku local -e .env.prod',
        qr: 'node app.js default-partner --qr',
        fixtures: 'node app.js --fixtures'
      },
      engines: {
        // http://vercel.link/node-version
        node: '20.x',
        npm: '10.x'
      }
    };

    let fileStr = JSON.parse(Fs.readFileSync('package.json', "utf8"));
    let updatedContent = JSON.stringify({...fileStr, ...vespaConfig}, null, 2);
    Fs.writeFile(`package.json`, updatedContent, (err) => {
      if (err){
        reject(err);
        return;
      }
      
      if(parseInt(process.env.VERBOSE)){
        console.log(Colors.grey('PackageJson updated ') + `package.json ➞ package.json}`);
      }
    });

  }

  static getRelativeDirectory() {
    const BASE_PATH = process.cwd();
    const PACKAGE_PATH = `${BASE_PATH}/node_modules/vespa-framework`;
    let copyFromNpmPackage = `${PACKAGE_PATH}/files-template`;
    let copyFromSource = `${BASE_PATH}/files-template`;
    let copyFrom;

    try {
      Fs.accessSync( copyFromNpmPackage, Fs.constants.F_OK);
      copyFrom = copyFromNpmPackage;
    } catch (e) {
      copyFrom = copyFromSource;
    }

    return copyFrom;

  }
  
}

export default Framework;
export {Server, Routes, Db, Crud, StylusVespa, Utils};