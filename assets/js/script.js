const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};
const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
  },
  set(transaction) {
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transaction)
    );
  },
};

const Transactions = {
  all: Storage.get(),
  add(transaction) {
    this.all.push(transaction);
    APP.reload();
  },
  incomes() {
    let income = 0;
    this.all.forEach((transaction) => {
      if (transaction.amount > 0) {
        income += transaction.amount;
      }
    });
    return income;
  },
  express() {
    let express = 0;
    this.all.forEach((transaction) => {
      if (transaction.amount < 0) {
        express += transaction.amount;
      }
    });
    return express;
  },
  total() {
    return this.incomes() + this.express();
  },
  remove(index) {
    this.all.splice(index, 1);
    APP.reload();
  },
};

const DOM = {
  transactionsContainer: document.querySelector("#data-table tbody"),
  addTransaction(transaction, index) {
    const tr = document.createElement("tr");
    tr.dataset.index = index;
    tr.innerHTML = DOM.innerHTMLTransactions(transaction, index);
    DOM.transactionsContainer.appendChild(tr);
  },
  innerHTMLTransactions(transaction, index) {
    const CSSClasse = transaction.amount > 0 ? "income" : "expense";
    const amount = Utils.formatCurrency(transaction.amount);
    const html = `
          <td class="description">${transaction.description}</td>
          <td class="${CSSClasse}">${amount}</td>
          <td class="date">${transaction.date}</td>
          <td>
            <img onclick="Transactions.remove(${index})" src="assets/images/minus.svg" alt="Remover Transação" />
          </td>`;
    return html;
  },
  updateBalance() {
    document.getElementById("incomeDisplay").innerHTML = Utils.formatCurrency(
      Transactions.incomes()
    );
    document.getElementById("expenseDisplay").innerHTML = Utils.formatCurrency(
      Transactions.express()
    );
    document.getElementById("totalDisplay").innerHTML = Utils.formatCurrency(
      Transactions.total()
    );
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  },
};

const Utils = {
  formatDate(date) {
    const splittedDate = date.split("-");
    return `${splittedDate[1]}/${splittedDate[2]}/${splittedDate[0]}`;
  },
  formatAmount(value) {
    value = Number(value) * 100;

    return value;
  },
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    value = String(value).replace(/\D/g, "");

    value = Number(value) / 100;

    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return signal + value;
  },
};

const Form = {
  description: document.querySelector("input#description"),
  amount: document.querySelector("input#amount"),
  date: document.querySelector("input#date"),
  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value,
    };
  },

  formateValues() {
    let { description, amount, date } = this.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);
    return {
      description,
      amount,
      date,
    };
  },

  validadeField() {
    const { description, amount, date } = this.getValues();
    if (
      description.trim() === "" ||
      amount.trim() === "" ||
      date.trim() === ""
    ) {
      throw new Error("Por favor, preencha todos os campos");
    }
  },

  clearFields() {
    this.description.value = "";
    this.amount.value = "";
    this.date.value = "";
  },

  submit(event) {
    event.preventDefault();
    try {
      this.validadeField();
      const transaction = this.formateValues();
      Transactions.add(transaction);
      this.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  },
};

const APP = {
  init() {
    Transactions.all.forEach(DOM.addTransaction);

    DOM.updateBalance();
    Storage.set(Transactions.all);
  },
  reload() {
    DOM.clearTransactions();
    APP.init();
  },
};

APP.init();
