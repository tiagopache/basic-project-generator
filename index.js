#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const CURR_DIR = process.cwd();

const CHOICES = fs.readdirSync(`${__dirname}/templates`);

const QUESTIONS = [
  {
    name: 'project-choice',
    type: 'list',
    message: 'What project template would you like to generate?',
    choices: CHOICES
  },
  {
    name: 'project-name',
    type: 'input',
    message: 'Project name:',
    validate: (input) => {
      if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
      else return 'Project name may only include letters, numbers, underscores and hashes.';
    }
  },
  {
    name: 'project-version',
    type: 'input',
    message: 'Project version:',
    default: () => '1.0.0',
    validate: (input) => {
      if (/^([\d\.\d\.\d])+$/.test(input)) return true;
      else return 'Project version may only include numbers and periods.';
    }
  },
  {
    name: 'project-description',
    type: 'input',
    message: 'Project description:',
    default: () => null,
    validate: (input) => {
      if (!input || /^([A-Za-z\-\_\d\s])+$/.test(input)) return true;
      else return 'Project description may include letters, numbers, underscores, hashes and spaces.';
    }
  },
  {
    name: 'project-author-name',
    type: 'input',
    message: 'Project author:',
    default: () => null,
    validate: (input) => {
      if (!input ||  /^([A-Za-z\s])+$/.test(input)) return true;
      else return 'Author name may include letters and spaces.';
    }
  },
  {
    name: 'project-author-email',
    type: 'input',
    message: 'Project author email:',
    default: () => null,
    validate: (input) => {
      if (!input || /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(input)) return true;
      else return 'Fill in with author email or leave it blank';
    }
  },
  {
    name: 'project-keywords',
    type: 'input',
    message: 'Keywords:',
    default: () => null,
    validate: (input) => {
      if (!input || /^([A-Za-z\-\_\d\s])+$/.test(input)) return true;
      else return 'Project keywords may include letters, numbers, underscores and hashes. \nUse space to enter more than one keyword.';
    }
  },
  {
    name: 'project-license',
    type: 'input',
    message: 'License:',
    default: () => 'ISC',
    validate: (input) => {
      if (!input || /^([A-Za-z\-\_\d\s])+$/.test(input)) return true;
      else return 'Project license may include letters, numbers, underscores and hashes.';
    }
  }
];

inquirer.prompt(QUESTIONS)
  .then(answers => {
    const projectChoice = answers['project-choice'];
    const projectName = answers['project-name'];
    const templatePath = `${__dirname}/templates/${projectChoice}`;
    const packageDetails = {
      name: projectName,
      version: answers['project-version'],
      description: answers['project-description'],
      author:
        answers['project-author-name'] && answers['project-author-email'] ?
          `${answers['project-author-name']} <${answers['project-author-email']}>` :
          answers['project-author-name'] ?
            `${answers['project-author-name']}` :
            answers['project-author-email'] ?
              `<${answers['project-author-email']}>` :
              '',
      keywords: answers['project-keywords'] ? answers['project-keywords'].split(' ') : [],
      license: answers['project-license']
    };

    fs.mkdirSync(`${CURR_DIR}/${projectName}`);

    createDirectoryContents(templatePath, projectName, packageDetails);
  });

const createDirectoryContents = (templatePath, newProjectPath, packageDetails) => {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach(file => {
    const origFilePath = `${templatePath}/${file}`;

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
      let contents = fs.readFileSync(origFilePath, 'utf-8');

      // Rename
      if (file === '.npmignore') {
        file = '.gitignore';
      } else if (file === 'package.json') {
        let package = JSON.parse(contents);
        contents = JSON.stringify(Object.assign(packageDetails, package), null, 2);
      }

      const writePath = `${CURR_DIR}/${newProjectPath}/${file}`;
      fs.writeFileSync(writePath, contents, 'utf-8');
    } else if (stats.isDirectory()) {
      fs.mkdirSync(`${CURR_DIR}/${newProjectPath}/${file}`);

      // recursive call
      createDirectoryContents(`${templatePath}/${file}`, `${newProjectPath}/${file}`);
    }
  });
};
