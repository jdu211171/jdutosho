### How to Contribute

We appreciate your interest in contributing to the jdutosho project! To get started, please follow these steps:

1. **Fork the repository**: Click the "Fork" button on the top right corner of the repository page to create a copy of the repository in your GitHub account.

2. **Clone the repository**: Clone the forked repository to your local machine.

```sh
git clone https://github.com/<your-username>/jdutosho.git
```

3. **Create a new branch**: Create a new branch for your feature or bug fix.

```sh
git checkout -b my-feature-branch
```

4. **Make your changes**: Make the desired changes to the codebase.

5. **Commit your changes**: Ensure your commit messages are clear and descriptive.

```sh
git add .
git commit -m "Description of the changes"
```

6. **Run the following scripts before pushing your changes**: Ensure your code is properly formatted and up-to-date.

```sh
npm run fix
git pull --rebase
```

7. **Push your changes**: Push your changes to your forked repository.

```sh
git push origin my-feature-branch
```

8. **Create a Pull Request**: Go to the original repository on GitHub and create a pull request from your forked repository.

### Code of Conduct

In order to ensure that the jdutosho community is welcoming to all, please review and abide by the [Code of Conduct](https://github.com/jdu211171/jdutosho/blob/main/CODE_OF_CONDUCT.md).

### Setting Up the Project

#### Backend

```sh
# Clone the repository
git clone https://github.com/jdu211171/jdutosho.git

# Change to the project directory
cd jdutosho

# Backend
cd backend
# Install dependencies
php composer.phar install
# Create .env file for local development
cp .env.example .env
# Create database called `jdutosho` in your MySQL database 
mysqladmin -u root -p create jdutosho
# Change .env configuration according to your credentials such as:
# DB_USERNAME=root
# DB_PASSWORD=
# Migrate project
php artisan migrate
# Start project
# php artisan serve
```

#### Frontend

```sh
cd ../frontend
# Create .env file for local development
cp .env.example .env
# Install dependencies
npm install
# Start project
npm run dev
```
