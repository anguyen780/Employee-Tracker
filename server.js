const express = require('express');
const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTable = require('console.table');
const { query } = require('express');

const PORT = process.env.PORT || 3001;
const app = express();
// Middle Ware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// connects to sql database
const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'rootroot',
        database: 'employee_db'
    }
);
// initializes app
function init() {
    welcomeScreen();
    startApp();
}
// ASCII art
welcomeScreen = () => {
    console.log(` 
    _______ _______ ______ _      _______ _     _ _______ _______   
    (_______|_______|_____ (_)    (_______) |   | (_______|_______)  
     _____   _  _  _ _____) )      _     _| |___| |_____   _____     
    |  ___) | ||_|| |  ____/ |    | |   | |_____  |  ___) |  ___)    
    | |_____| |   | | |    | |____| |___| |_____| | |_____| |_____   
    |_______)_|   |_|_|    |_______)_____/(_______|_______)_______)  
                                                                     
     _______ ______  _______ _______ _     _ _______ ______          
    (_______|_____ \(_______|_______|_)   | (_______|_____ \         
        _    _____) )_______ _       _____| |_____   _____) )        
       | |  |  __  /|  ___  | |     |  _   _)  ___) |  __  /         
       | |  | |  \ \| |   | | |_____| |  \ \| |_____| |  \ \         
       |_|  |_|   |_|_|   |_|\______)_|   \_)_______)_|   |_|        
                                                                     `);
};
// begins prompt choices
const startApp = () => {
    inquirer
        .prompt([
            {
                type: 'list',
                name: 'option',
                message: 'What would you like to do?',
                choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Exit']
            }
        ]).then((answers) => {
            switch (answers.option) {
                case 'View all departments':
                    viewDeparts();
                    break;
                case 'View all roles':
                    viewRoles();
                    break;
                case 'View all employees':
                    viewEmployees();
                    break;
                case 'Add a department':
                    addDepart();
                    break;
                case 'Add a role':
                    addRole();
                    break;
                case 'Add an employee':
                    addEmployee();
                    break;
                case 'Update an employee role':
                    updateEmployee();
                    break;
                case 'Exit':
                    console.log('Thank you for using Employee Tracker.');
                    process.exit();
            }
        })
};
// view all departments
function viewDeparts() {
    db.query('SELECT * FROM department', function (err, res) {
        if (err) throw err;
        console.table('All Departments:', res);
        startApp();
    })
};
// view all roles
function viewRoles() {
    db.query('SELECT role.id, role.title, department.name, role.salary FROM role JOIN department ON role.department_id = department.id', function (err, res) {
        if (err) throw err;
        console.table('All Roles:', res);
        startApp();
    })
};
// view all employees
function viewEmployees() {
    db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(employee.first_name, ' ',employee.last_name) AS manager 
    FROM employee INNER JOIN role ON employee.role_id = role.id 
    INNER JOIN department on role.department_id = department.id 
    LEFT JOIN employee manager ON manager.id = employee.manager_id`, function (err, res) {
        if (err) throw err;
        console.table('All Employees:', res);
        startApp();
    })
};
// adds departments
function addDepart() {
    inquirer
        .prompt([
            {
                name: 'newDepart',
                type: 'input',
                message: 'What is the name of the department?'
            }
        ]).then((answer) => {
            db.query(`INSERT INTO department SET ?`, {
                name: answer.newDepart
            });
            db.query('SELECT * FROM department', function (err, res) {
                if (err) throw err;
                console.log(`Added ${answer.newDepart} to the database`);
                startApp();
            })
        })
};
// adds roles, salary of role and assigns role to a department
function addRole() {
    db.query('SELECT * FROM department', function (err, res) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: 'newRole',
                    type: 'input',
                    message: 'What is the name of the role?'
                },
                {
                    name: 'salary',
                    type: 'input',
                    message: 'What is the salary of the role?'
                },
                {
                    name: 'department',
                    type: 'list',
                    choices: function () {
                        let departmentArr = [];
                        for (let i = 0; i < res.length; i++) {
                            departmentArr.push(res[i].name);
                        }
                        return departmentArr
                    }
                }
            ]).then((answers) => {
                let department_id;
                for (let k = 0; k < res.length; k++) {
                    if (res[k].name == answers.department) {
                        department_id = res[k].id;
                    }
                }
                db.query(`INSERT INTO role
    SET ?`, {
                    title: answers.newRole,
                    salary: answers.salary,
                    department_id: department_id
                })
                console.log(`Added ${answers.newRole} to the database`);
                startApp();
            })
    })
};
// adds employee
function addEmployee() {
    let roleArr = [];
    let managerArr = [];

    db.query('SELECT title FROM role', (err, res) => {
        for (let i = 0; i < res.length; i++) {
            roleArr.push(res[i].title)
        }
    })

    db.query('SELECT CONCAT(employee.first_name, " ",employee.last_name) as manager FROM employee', (err, result) => {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            managerArr.push(result[i].manager);
        }
    })

    inquirer
        .prompt([
            {
                type: 'input',
                name: 'firstName',
                message: `What is the employee's first name?`
            },
            {
                type: 'input',
                name: 'lastName',
                message: `What is the employee's last name?`
            },
            {
                type: 'list',
                name: 'roleChoices',
                message: `What is the employee's role?`,
                choices: roleArr
            },
            {
                type: 'list',
                name: 'employeeMan',
                message: `Who is the employee's manager?`,
                choices: managerArr
            }
        ]).then((answer) => {
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUE (${answer.firstName}),(${answer.lastName}),(${answer.roleChoices}),(${answer.employeeMan})`, (err, res) => {
                console.log(`Added ${answer.firstName} ${answer.lastName} to the database`);
                startApp();
            })
        })
};
// updates employee
function updateEmployee() {
    let employeeArr = [];
    let roleArr = [];

    db.query('SELECT CONCAT(employee.first_name, " ",employee.last_name) as employees FROM employee', (err, result) => {
        if (err) throw err;
        for (let i = 0; i < result.length; i++) {
            employeeArr.push(result[i].employees);
        }
        db.query('SELECT title FROM role', (err, res) => {
            for (let k = 0; k < res.length; k++) {
                roleArr.push(res[k].title);
            }
        })
        inquirer
            .prompt([
                {
                    type: 'list',
                    name: 'eName',
                    message: 'Which employee would you like to update?',
                    choices: employeeArr
                },
                {
                    type: 'list',
                    name: 'newRole',
                    message: 'Which role would you like to assign to the employee?',
                    choices: roleArr
                }
            ])
            .then((answer) => {
                db.query('UPDATE employee SET role_id = ? WHERE employee_id = ?', [answer.eName, answer.newRole], (err, results) => {
                    startApp();
                })
            })
    })


}

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    init();
});
