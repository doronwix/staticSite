const Generator = require('yeoman-generator');
module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.log('Initializing...');
    this.answers = [];
  }
  start() {
    
    
  }

  async prompting() {
     this.answers = await this.prompt([
      {
        type: "input",
        name: "name",
        message: "Enter a name for the new test (i.e.: myNewTest):",
        default: this.appname // Default to current folder name
      },
      {
        type: "input",
        name: "folder",
        message: "test file location (i.e managers):",
        default: "managers"
      },
      {
        type: "input",
        name: "testSource",
        message: "test Source Require location, case sensitive (i.e FxNet/LogicLayer/GeneralManager/newVm):",
        default:"FxNet/LogicLayer/"
      }
    ]);
  }

 writing() {
  this.destinationRoot('../testjs');
  let test_name = this.answers.name;
  let test_file_location = '../TestJS/Tests/' + this.answers.folder + '/' + test_name;
    this.fs.copyTpl(
       this.templatePath('test.html'),
       
       this.destinationPath(this.answers.name + '.html'),
       {
         destination: test_file_location,
         title: test_name
       }
    );
    this.fs.copyTpl(
      this.templatePath('test.js'),
      this.destinationPath(test_file_location + '.js'),
      {
       testSource: this.answers.testSource
      }
   );
  }
};