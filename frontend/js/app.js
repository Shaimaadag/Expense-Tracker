const API_URL = "http://localhost:3000/api/expenses";
let editModalInstance;
let expenses;
let expensesChart = null;
const loadingSpinner= document.getElementById("loadingSpinner");
const darkModeButton = document.getElementById("darkModeButton");

darkModeButton.addEventListener("click", ()=>{
    document.body.classList.toggle("dark-mode");
});

async function getExpenses() {
    try {
        const result= await fetch(API_URL);
        if (!result.ok) {
            throw new Error("Failed to load expenses");
        }
        const data= await result.json();      
        
       return data;
    } catch (error) {
        throw error;
    }
}


async function refresh() {
    toggleSpinner(true);

    try {
        const data = await getExpenses();
        expenses = data;
        
        renderTable(expenses);
        renderSummary(expenses);
        renderChart(expenses);

    } catch (error) {
        showAlert("Unable to connect to the server. Please try again.");
    } finally {
        toggleSpinner(false);
    }
}
refresh();

function toggleSpinner(show) {
    if (show) {
        loadingSpinner.classList.remove("d-none");
    } else {
        loadingSpinner.classList.add("d-none");
    }
}

function showAlert(message) {
    const alertContainer= document.getElementById("alertContainer");
    const alert= document.createElement("div");
    alert.className= "alert alert-danger";
    alert.innerHTML=  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill flex-shrink-0 me-2" viewBox="0 0 16 16" role="img" aria-label="Warning:">
    <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
  </svg> ${message}` 

  alertContainer.appendChild(alert);
}

const totalAmount= document.getElementById("totalAmount");
const numberOfExpenses= document.getElementById("numberOfExpenses");
const highestExpenses= document.getElementById("highestExpenses");
const nameOfHighest= document.getElementById("nameOfHighest");
function renderSummary(list) {
    let total=0;

    list.forEach(expense => {
    total+=expense.amount;
    });

totalAmount.innerHTML=total;
numberOfExpenses.innerHTML= list.length;

let highest=0;
list.forEach(expense => {
    if(expense.amount > highest){
        highest= expense.amount;
        nameOfHighest.innerHTML= expense.title;
    }
});
highestExpenses.innerHTML= highest;

}

//ما ستخدمت async/await لانها داله هي فقط تستقبل قائمة وتعرضها
function renderTable(list) {
   const tableBodyFilter= document.getElementById("bodyContain");
   tableBodyFilter.innerHTML="";

   list.forEach(element => {
    const row= document.createElement("tr");
    const titleCill= document.createElement("td");
    titleCill.innerHTML=element.title;
    row.appendChild(titleCill);

    const amountCill= document.createElement("td");
    amountCill.innerHTML= element.amount;
    row.appendChild(amountCill);

    const categoryCill= document.createElement("td");
    const categoryBadge = document.createElement("span");
    categoryBadge.innerHTML= element.category;
    categoryBadge.classList.add("badge");
    categoryCill.appendChild(categoryBadge);
    
    if (element.category === "Food") {
    categoryBadge.classList.add("text-bg-success");
}
    if(element.category==="Transport"){
        categoryBadge.classList.add("text-bg-primary");
    }

    if(element.category==="Bills"){
        categoryBadge.classList.add("text-bg-warning");
    }

    if(element.category==="Entertainment"){
        categoryBadge.classList.add("text-bg-info");
    }

    if(element.category==="Other"){
        categoryBadge.classList.add("text-bg-secondary");
    }
    row.appendChild(categoryCill);

    const dateCill= document.createElement("td");
    dateCill.innerHTML= element.date;
    row.appendChild(dateCill);

    const actionCill= document.createElement("td");
    const editButton= document.createElement("button");
    const deleteButton= document.createElement("button");

    editButton.innerHTML="Edie";
    deleteButton.innerHTML="Delete";

    actionCill.appendChild(editButton);
    actionCill.appendChild(deleteButton);

    editButton.addEventListener("click", ()=>{
        editExpense(element.id);
    });
    editButton.classList.add("me-2");

    editButton.classList.add("btn", "btn-outline-secondary");
    deleteButton.classList.add("btn", "btn-outline-danger");

     deleteButton.addEventListener("click", ()=>{
        deleteExpense(element.id);
    })
    row.appendChild(actionCill);
    tableBodyFilter.appendChild(row);
   });
}

async function  getExpensesByID(id) {
    try {
        toggleSpinner(true);
        const result= await fetch(`${API_URL}/${id}`);

        if (!result.ok) {
            const data = await result.json();
            showAlert(data.message);
            return null;
        }

        const data= await result.json();
        return data;
        } catch (error) {
        showAlert("Unable to connect to the server. Please try again.");
    }finally{
        toggleSpinner(false);
    }
}

let editId;
async function editExpense(id) {
    const data= await getExpensesByID(id);
     if (data === null) {
        return;
    }
    try {
        editId=id;
       const editModal= document.getElementById("editModal");
       const titleModal= document.getElementById("titleModal");
       titleModal.value= data.title;

       const amountModal= document.getElementById("amountModal");
       amountModal.value= data.amount;

       const modalCategory= document.getElementById("modalCategory");
       modalCategory.value= data.category;

       const dateModal= document.getElementById("dateModal");
       dateModal.value= data.date;

       editModalInstance = new bootstrap.Modal(editModal);
       editModalInstance.show();
    } catch (error) {
        showAlert("Unable to connect to the server. Please try again.");
    }   
}

const saveEditButton=document.getElementById("saveEditButton");
const titleModal=document.getElementById("titleModal");
const amountModal=document.getElementById("amountModal");
const modalCategory=document.getElementById("modalCategory");
const dateModal=document.getElementById("dateModal");

saveEditButton.addEventListener("click",async (event)=>{
    
    const titleM = titleModal.value;
    const amountM = amountModal.value;
    const categoryM = modalCategory.value;
    const dateM = dateModal.value;

    if(titleM.trim()===""){
        titleModal.classList.add("is-invalid");
        return;
    }
    titleModal.classList.remove("is-invalid");

    if(Number(amountM)<=0){
        amountModal.classList.add("is-invalid");
        return;
    }
    amountModal.classList.remove("is-invalid");

    if(categoryM===""){
        modalCategory.classList.add("is-invalid");
        return;
    }
    modalCategory.classList.remove("is-invalid");

    if(dateM===""){
        dateModal.classList.add("is-invalid");
        return;
    }
    dateModal.classList.remove("is-invalid");

    const data={
        title: titleM,
        amount: amountM,
        category: categoryM,
        date: dateM
    }

    await updateExpense(editId, data);
    
});

async function updateExpense(id, data) {
    try {
        toggleSpinner(true);
        const result= await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        const responseData= await result.json();
        if (!result.ok) {
            showAlert(responseData.message);
            return;
        }
        await refresh();
        editModalInstance.hide();
    } catch (error) {
        showAlert("Unable to connect to the server. Please try again.");
    }
    finally{
        toggleSpinner(false);
    }
}

async function deleteExpense(id) {
    try {
        toggleSpinner(true);
        const result= await fetch(`${API_URL}/${id}`,{
            method: "DELETE"
        });
        const data= await result.json();
        if (!result.ok) {
            showAlert(data.message);
            return;
        }
        await refresh();
    } catch (error) {
        showAlert("Unable to connect to the server. Please try again.");
    }
    finally{
        toggleSpinner(false);
    }
}

async function addExpense(data) {
    try {
        toggleSpinner(true);
        const result = await fetch(`${API_URL}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const responseData = await result.json();
        if(!result.ok){
            showAlert(responseData.message);
             return;
        }
        await refresh();
    } catch(error) {
        showAlert("Unable to connect to the server. Please try again.");
    }
    finally{
        toggleSpinner(false);
    }
}

const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("validationCustom01");
const amountInput = document.getElementById("validationCustom02");
const categoryInput = document.getElementById("expenseCategory");
const dateInput = document.getElementById("validationCustom05");
const amountFeedback = document.getElementById("amountFeedback");

expenseForm.addEventListener("submit", (event)=>{
    event.preventDefault();

    let isValid = true;

    if(titleInput.value.trim() === ""){
        titleInput.classList.add("is-invalid");
        isValid=false;
    }else{
        titleInput.classList.remove("is-invalid");
    }
    
    if(amountInput.value ===""){
        amountInput.classList.add("is-invalid");
        amountFeedback.textContent = "Amount is required.";
        isValid=false;
    }else if(Number(amountInput.value)<=0){
        amountInput.classList.add("is-invalid");
        amountFeedback.textContent = "Amount must be greater than 0.";
        isValid=false;
    }else{
        amountInput.classList.remove("is-invalid");
    }

    if(categoryInput.value === ""){
        categoryInput.classList.add("is-invalid");
        isValid=false;
    }else{
        categoryInput.classList.remove("is-invalid");
    }

    if(dateInput.value === ""){
        dateInput.classList.add("is-invalid");     
        isValid=false;
    }else{
        dateInput.classList.remove("is-invalid");
    }

    if(!isValid){
        return;
    }
   const data={
    title: titleInput.value,
    amount: amountInput.value,
    category: categoryInput.value,
    date: dateInput.value
    }

    addExpense(data);
    titleInput.value="";
    amountInput.value="";
    categoryInput.value="";
    dateInput.value="";
});

const filterCategory= document.getElementById("filterCategory");
filterCategory.addEventListener("change", ()=>{
    const filterValue= filterCategory.value;

    if(filterValue=="")
        return renderTable(expenses);

   const filterExpensed= expenses.filter(expense => {
        return expense.category===filterValue;
    });

    renderTable(filterExpensed);
});

function getCategoryTotals(list) {
    const totals = {
        Food: 0,
        Bills: 0,
        Transport: 0,
        Entertainment: 0,
        Other: 0
    };

    list.forEach(expense => {
        totals[expense.category] += expense.amount;
    });

    return totals;
}
function renderChart(list) {
    const totals = getCategoryTotals(list);

    const ctx = document.getElementById("expensesChart");

    if (expensesChart instanceof Chart) {
        expensesChart.destroy();
    }

    expensesChart = new Chart(ctx, {
        type: "bar",

        data: {
            labels: [
                "Food",
                "Bills",
                "Transport",
                "Entertainment",
                "Other"
            ],

            datasets: [{
                label: "Expenses",
                data: [
                    totals.Food,
                    totals.Bills,
                    totals.Transport,
                    totals.Entertainment,
                    totals.Other
                ]
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}