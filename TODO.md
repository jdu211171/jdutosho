# JDU Tosho - TODO List

## 1. Simplify Book Adding Process

### User Perspective: The Librarian

**The Problem:** Adding new books to the library system is a slow and frustrating process. When we receive a large shipment of new books, entering them into the system one-by-one takes hours.

#### Frontend (What the Librarian Sees and Does):

-   [ ] **Complicated Form:** The form for adding a new book at `/librarian/books/new` asks for too much information that isn't essential, like the author, language, and category. We only need to record the book's title and its unique code.
-   [ ] **Repetitive Work:** For each book, I have to fill out and submit the same form over and over. There's no way to add a list of books at once.
-   [ ] **Ideal Workflow:** I should be able to quickly enter just the book title and code. Even better, I'd love to be able to copy and paste a list of new book titles and codes to add them in a single step.

#### Backend (How the System Works, from the Librarian's Point of View):

-   [ ] **Strict Rules:** The system is too rigid and demands details for every book that we don't actually use. It forces me to enter an author or category, even for books where this isn't relevant.
-   [ ] **One-by-One Processing:** The system is designed to handle only one book at a time. It can't understand or process a list of books, which is why I can't add them in bulk. This limitation is the core reason for the bottleneck in our workflow.

## 2. Improve Rented Book Tracking

### User Perspective: The Librarian

**The Problem:** Finding information about rented books is difficult and time-consuming. The current system doesn't show all the necessary details in one place, forcing me to manually dig into records to find what I need.

#### Frontend (What the Librarian Sees and Does):

-   [ ] **Unclear Search Results:** When I search for rented books at `/librarian/rents`, the list is confusing. It's hard to quickly see which student has which book.
-   [ ] **Missing Student ID:** The list shows the student's name but not their ID. With many students having similar names, the ID is crucial for me to know exactly who has the book and to contact them if needed.
-   [ ] **Manual Checking:** I have to click on each individual record to confirm the details, which is inefficient when I'm trying to get an overview of all rented books.
-   [ ] **Ideal Workflow:** I want to see a clear, simple table that shows the book title, the student's full name, and their student ID all in one row. This would save me a lot of time.

#### Backend (How the System Works, from the Librarian's Point of View):

-   [ ] **Incomplete Data:** When I ask the system for a list of rented books, it isn't fetching the student's ID along with their name. It knows who the student is but isn't sharing that key piece of information with me.
-   [ ] **Poor Data Connection:** The system should automatically link a rented book to the student who borrowed it and display their ID. It feels like these two pieces of information are disconnected, making my job harder.

## 3. Simplify Book Return Process for Students

### User Perspective: The Student

**The Problem:** Returning a book is unnecessarily complicated and takes too much time. After I log in, I have to navigate through multiple sections just to find the return button, which is frustrating when I'm in a hurry between classes.

#### Frontend (What the Student Sees and Does):

-   [ ] **Too Many Steps:** After logging in at `/student`, I can't immediately see my rented books or a return option. I have to click through several menus to get to where I can return a book.
-   [ ] **Hidden Return Button:** The return functionality is buried somewhere in `/student/rents` and it's not obvious where to find it. I waste time looking for it every time.
-   [ ] **No Quick Access:** There's no shortcut or quick return option on my main dashboard. I have to go through the same long process every time I want to return a book.
-   [ ] **Ideal Workflow:** I want to see my borrowed books right on my main page when I log in, with a simple "Return" button next to each book. One click should be enough to return a book.

#### Backend (How the System Works, from the Student's Point of View):

-   [ ] **Complex Navigation:** The system forces me to go through multiple pages before I can perform a simple return action. It doesn't prioritize the most common student task - returning books.
-   [ ] **No Dashboard Integration:** The system treats book returns as a separate feature instead of integrating it into my main student dashboard where it would be most convenient and logical.
