const HistoryTemplate = require("./history.template");
const SaitoOverlay = require("./../../saito-overlay/saito-overlay");

class MixinHistory {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.overlay = new SaitoOverlay(this.app, this.mod);
    this.history_data = null;

    this.app.connection.on("saito-crypto-history-render-request", (obj) => {
      this.render();
    });
  }

  async render() {
    this_history = this;
    this.mod = await this.app.wallet.returnPreferredCrypto();
    this.overlay.show(HistoryTemplate(this.app, this.mod, this));

    document.querySelector(".mixin-txn-his-container .saito-table-body").innerHTML = '';

    document.querySelector(".ticker-placeholder").innerHTML = this.mod.ticker;

    if (this.mod.ticker != "SAITO") {
      this.mod.returnHistory(this.mod.asset_id, 20, (d) => { 
        
        this.history_data = d; 
        let html = "";

        if (d.length > 0) {
          for (let i = 0; i < d.length; i++) {
              let row = d[i];
              let created_at = row.created_at.slice(0, 19).replace('T', ' ');
              let type = row.type;
              let amount = Math. abs(row.amount);
              let indicator = (type == 'Deposit') ? '+' : '-';

              html += "<div class='saito-table-row'><div class='mixin-his-created-at'>"+ created_at +"</div>" +
              "<div>"+ type +"</div>" +
              "<div class='"+ type.toLowerCase() +"'>"+ indicator + " " + amount +"</div>" +
              "<div>Success</div></div>"; /* right now we dont get `status` in /snapshot api, all row are `success`*/
          }

          document.querySelector(".mixin-txn-his-container .saito-table-body").innerHTML += html;
          this.attachEvents();
        }  else {
          document.querySelector(".mixin-txn-his-container .saito-table-body").innerHTML = '<p class="mixin-no-history">No account history found.</p>';
        }
      }); 
    } else {
      document.querySelector(".mixin-txn-his-container .saito-table-body").innerHTML = `
      <a target="_blank" href="/explorer" class="saito-history-msg">View SAITO history on block explorer <i class="fa-solid fa-arrow-up-right-from-square"></i></a>`;
    }
   
    this.attachEvents();
  }  



  attachEvents() {    

    const paginationNumbers = document.getElementById("pagination-numbers");
    const listItems = document.querySelectorAll(".mixin-txn-his-container .saito-table-row");
    const nextButton = document.getElementById("next-button");
    const prevButton = document.getElementById("prev-button");

    const paginationLimit = 10;
    const pageCount = Math.ceil(listItems.length / paginationLimit);
    let currentPage = 1;

    if (listItems.length == 0) {
      document.querySelector(".pagination-container").classList.add("disabled");
    }

    const disableButton = (button) => {
      button.classList.add("disabled");
      //button.setAttribute("disabled", true);
    };

    const enableButton = (button) => {
      button.classList.remove("disabled");
      //button.removeAttribute("disabled");
    };

    const handlePageButtonsStatus = () => {
      if (currentPage === 1) {
        disableButton(prevButton);
      } else {
        enableButton(prevButton);
      }

      if (pageCount === currentPage) {
        disableButton(nextButton);
      } else {
        enableButton(nextButton);
      }
    };

    const handleActivePageNumber = () => {
      document.querySelectorAll(".pagination-number").forEach((button) => {
        button.classList.remove("active");
        const pageIndex = Number(button.getAttribute("page-index"));
        if (pageIndex == currentPage) {
          button.classList.add("active");
        }
      });
    };

    const appendPageNumber = (index) => {
      const pageNumber = document.createElement("div");
      pageNumber.className = "pagination-number";
      pageNumber.innerHTML = index;
      pageNumber.setAttribute("page-index", index);
      pageNumber.setAttribute("aria-label", "Page " + index);

      paginationNumbers.appendChild(pageNumber);
    };

    const getPaginationNumbers = () => {
      for (let i = 1; i <= pageCount; i++) {
        appendPageNumber(i);
      }
    };

    const setCurrentPage = (pageNum) => {
      currentPage = pageNum;

      handleActivePageNumber();
      handlePageButtonsStatus();
      
      const prevRange = (pageNum - 1) * paginationLimit;
      const currRange = pageNum * paginationLimit;

      listItems.forEach((item, index) => {
        item.classList.add("hidden");
        if (index >= prevRange && index < currRange) {
          item.classList.remove("hidden");
        }
      });
    };

    getPaginationNumbers();
    setCurrentPage(1);

    prevButton.addEventListener("click", () => {
      if (currentPage > 1){
        setCurrentPage(currentPage - 1);  
      }
    });

    nextButton.addEventListener("click", () => {
      if (currentPage < pageCount){
        setCurrentPage(currentPage + 1);
      }
    });

    document.querySelectorAll(".pagination-number").forEach((button) => {
      const pageIndex = Number(button.getAttribute("page-index"));

      if (pageIndex) {
        button.addEventListener("click", () => {
          setCurrentPage(pageIndex);
        });
      }
    });

    if (this.mod.ticker == "SAITO") {
      document.querySelector('.pagination-container').style.display = 'none';
    }
  }

}

module.exports = MixinHistory;