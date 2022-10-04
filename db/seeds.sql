-- Insert values into department table -- 
INSERT INTO department (name)
VALUES 
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal');
-- Insert values into role table --
INSERT INTO role (title, salary, department_id)
VALUES 
    ('Shift Lead', 50000, 1),
    ('Sales Lead', 70000, 1),
    ('Senior Developer', 100000, 2),
    ('Software Developer', 70000, 2),
    ('Accountant', 80000, 3),
    ('Lawyer', 120000, 4);
-- Insert values into employee table -- 
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('John','Doe', 1, null),
    ('Jeff', 'Halberd', 2, null),
    ('Alexa', 'Martinez', 3, 1),
    ('Patrick', 'Gonzalez', 4, 2),
    ('Lois', 'Lefen', 5, 2),
    ('Mike', 'Wazowski', 6, 1);