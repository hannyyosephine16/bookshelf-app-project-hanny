/**
 * Bookshelf App - Complete Implementation
 * Mengelola koleksi buku dengan localStorage
 */

// Constants
const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render-bookshelf';

// Global variables
let books = [];
let isEditing = false;
let editingBookId = null;

// Book object structure
function createBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete
  };
}

// Generate unique ID using timestamp
function generateId() {
  return +new Date();
}

// DOM manipulation functions
function findBook(bookId) {
  for (const book of books) {
    if (book.id === bookId) {
      return book;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function addBook() {
  const titleInput = document.getElementById('bookFormTitle');
  const authorInput = document.getElementById('bookFormAuthor');
  const yearInput = document.getElementById('bookFormYear');
  const isCompleteInput = document.getElementById('bookFormIsComplete');

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const year = parseInt(yearInput.value);
  const isComplete = isCompleteInput.checked;

  if (!title || !author || !year) {
    alert('Semua field harus diisi!');
    return;
  }

  if (year < 0) {
    alert('Tahun tidak boleh negatif!');
    return;
  }

  const generatedID = generateId();
  const bookObject = createBookObject(generatedID, title, author, year, isComplete);

  books.push(bookObject);

  // Reset form
  titleInput.value = '';
  authorInput.value = '';
  yearInput.value = '';
  isCompleteInput.checked = false;
  updateSubmitButtonText();

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  alert('Buku berhasil ditambahkan!');
}

function editBook() {
  const titleInput = document.getElementById('bookFormTitle');
  const authorInput = document.getElementById('bookFormAuthor');
  const yearInput = document.getElementById('bookFormYear');
  const isCompleteInput = document.getElementById('bookFormIsComplete');

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const year = parseInt(yearInput.value);
  const isComplete = isCompleteInput.checked;

  if (!title || !author || !year) {
    alert('Semua field harus diisi!');
    return;
  }

  if (year < 0) {
    alert('Tahun tidak boleh negatif!');
    return;
  }

  const bookTarget = findBook(editingBookId);
  if (bookTarget == null) return;

  bookTarget.title = title;
  bookTarget.author = author;
  bookTarget.year = year;
  bookTarget.isComplete = isComplete;

  // Reset form and editing state
  titleInput.value = '';
  authorInput.value = '';
  yearInput.value = '';
  isCompleteInput.checked = false;
  
  isEditing = false;
  editingBookId = null;
  updateSubmitButtonText();

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  alert('Buku berhasil diperbarui!');
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  
  if (bookTarget === -1) return;

  const book = books[bookTarget];
  const confirmDelete = confirm(`Apakah Anda yakin ingin menghapus buku "${book.title}"?`);
  
  if (confirmDelete) {
    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    alert('Buku berhasil dihapus!');
  }
}

function moveBook(bookId) {
  const bookTarget = findBook(bookId);
  
  if (bookTarget == null) return;

  bookTarget.isComplete = !bookTarget.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  const status = bookTarget.isComplete ? 'Selesai dibaca' : 'Belum selesai dibaca';
  alert(`Buku "${bookTarget.title}" dipindahkan ke rak "${status}"`);
}

function startEditBook(bookId) {
  const bookTarget = findBook(bookId);
  
  if (bookTarget == null) return;

  // Fill form with book data
  document.getElementById('bookFormTitle').value = bookTarget.title;
  document.getElementById('bookFormAuthor').value = bookTarget.author;
  document.getElementById('bookFormYear').value = bookTarget.year;
  document.getElementById('bookFormIsComplete').checked = bookTarget.isComplete;

  // Set editing state
  isEditing = true;
  editingBookId = bookId;
  updateSubmitButtonText();

  // Scroll to form
  document.getElementById('bookForm').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  // Reset form
  document.getElementById('bookFormTitle').value = '';
  document.getElementById('bookFormAuthor').value = '';
  document.getElementById('bookFormYear').value = '';
  document.getElementById('bookFormIsComplete').checked = false;

  // Reset editing state
  isEditing = false;
  editingBookId = null;
  updateSubmitButtonText();
}

function updateSubmitButtonText() {
  const submitButton = document.getElementById('bookFormSubmit');
  const span = submitButton.querySelector('span');
  const isCompleteCheckbox = document.getElementById('bookFormIsComplete');

  if (isEditing) {
    submitButton.innerHTML = 'Perbarui Buku';
    // Add cancel button if not exists
    let cancelButton = document.getElementById('cancelEditButton');
    if (!cancelButton) {
      cancelButton = document.createElement('button');
      cancelButton.id = 'cancelEditButton';
      cancelButton.type = 'button';
      cancelButton.textContent = 'Batal';
      cancelButton.style.marginLeft = '10px';
      cancelButton.addEventListener('click', cancelEdit);
      submitButton.parentNode.appendChild(cancelButton);
    }
  } else {
    // Remove cancel button if exists
    const cancelButton = document.getElementById('cancelEditButton');
    if (cancelButton) {
      cancelButton.remove();
    }

    const status = isCompleteCheckbox.checked ? 'Selesai dibaca' : 'Belum selesai dibaca';
    submitButton.innerHTML = `Masukkan Buku ke rak <span>${status}</span>`;
  }
}

function makeBookElement(bookObject) {
  const bookItem = document.createElement('div');
  bookItem.setAttribute('data-bookid', bookObject.id);
  bookItem.setAttribute('data-testid', 'bookItem');
  bookItem.classList.add('book-item');

  const bookTitle = document.createElement('h3');
  bookTitle.setAttribute('data-testid', 'bookItemTitle');
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
  bookAuthor.innerText = `Penulis: ${bookObject.author}`;

  const bookYear = document.createElement('p');
  bookYear.setAttribute('data-testid', 'bookItemYear');
  bookYear.innerText = `Tahun: ${bookObject.year}`;

  const buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');

  const toggleButton = document.createElement('button');
  toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
  toggleButton.classList.add('toggle-button');

  const deleteButton = document.createElement('button');
  deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
  deleteButton.classList.add('delete-button');
  deleteButton.innerText = 'Hapus Buku';

  const editButton = document.createElement('button');
  editButton.setAttribute('data-testid', 'bookItemEditButton');
  editButton.classList.add('edit-button');
  editButton.innerText = 'Edit Buku';

  if (bookObject.isComplete) {
    toggleButton.innerText = 'Belum selesai dibaca';
    toggleButton.addEventListener('click', function () {
      moveBook(bookObject.id);
    });
  } else {
    toggleButton.innerText = 'Selesai dibaca';
    toggleButton.addEventListener('click', function () {
      moveBook(bookObject.id);
    });
  }

  deleteButton.addEventListener('click', function () {
    removeBook(bookObject.id);
  });

  editButton.addEventListener('click', function () {
    startEditBook(bookObject.id);
  });

  buttonContainer.append(toggleButton, deleteButton, editButton);
  bookItem.append(bookTitle, bookAuthor, bookYear, buttonContainer);

  return bookItem;
}

function searchBooks(query) {
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(query.toLowerCase())
  );
  renderBooks(filteredBooks);
}

function renderBooks(booksToRender = books) {
  const incompleteBookList = document.getElementById('incompleteBookList');
  const completeBookList = document.getElementById('completeBookList');

  // Clear existing content
  incompleteBookList.innerHTML = '';
  completeBookList.innerHTML = '';

  for (const bookItem of booksToRender) {
    const bookElement = makeBookElement(bookItem);
    
    if (bookItem.isComplete) {
      completeBookList.append(bookElement);
    } else {
      incompleteBookList.append(bookElement);
    }
  }

  // Show empty state messages
  if (incompleteBookList.children.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Tidak ada buku yang belum selesai dibaca.';
    emptyMessage.classList.add('empty-message');
    incompleteBookList.append(emptyMessage);
  }

  if (completeBookList.children.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.textContent = 'Tidak ada buku yang sudah selesai dibaca.';
    emptyMessage.classList.add('empty-message');
    completeBookList.append(emptyMessage);
  }
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function isStorageExist() {
  if (typeof(Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function () {
  const bookForm = document.getElementById('bookForm');
  const searchForm = document.getElementById('searchBook');
  const isCompleteCheckbox = document.getElementById('bookFormIsComplete');

  // Form submission
  bookForm.addEventListener('submit', function (event) {
    event.preventDefault();
    
    if (isEditing) {
      editBook();
    } else {
      addBook();
    }
  });

  // Search functionality
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchQuery = document.getElementById('searchBookTitle').value.trim();
    
    if (searchQuery) {
      searchBooks(searchQuery);
    } else {
      renderBooks(); // Show all books if search is empty
    }
  });

  // Real-time search
  document.getElementById('searchBookTitle').addEventListener('input', function (event) {
    const searchQuery = event.target.value.trim();
    
    if (searchQuery) {
      searchBooks(searchQuery);
    } else {
      renderBooks(); // Show all books if search is empty
    }
  });

  // Update submit button text when checkbox changes
  isCompleteCheckbox.addEventListener('change', updateSubmitButtonText);

  // Load data from localStorage
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Render event listener
document.addEventListener(RENDER_EVENT, function () {
  renderBooks();
});

// Initialize submit button text
document.addEventListener('DOMContentLoaded', function() {
  updateSubmitButtonText();
});

console.log('Bookshelf App loaded successfully!');