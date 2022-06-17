

const template = ` <div class="calendar">
<div class="calendar-month">
  <i class="fas fa-angle-left calendar-prev"></i>
  <div class="calendar-date">
    <div>
      <h4>December</h4>
      <p>2022</p>
    </div>

  </div>
  <i class="fas fa-angle-right calendar-next"></i>
</div>
<div class="calendar-weekdays">
  <div>S</div>
  <div>M</div>
  <div>Tu</div>
  <div>W</div>
  <div>Th</div>
  <div>F</div>
  <div>Sat</div>
</div>
<div class="calendar-days">

</div>
</div>`;

const state = {

    monthDays: "",
    lastDay: "",
    prevLastDay: "",
    firstDayIndex: "",
    lastDayIndex: "",
    nextDays: "",
    months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ]
}

let date = new Date();



const renderCalendar = () => {
    console.log(date)
    state.monthDays = document.querySelector(".calendar-days");
    state.lastDay = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
    ).getDate();
    state.prevLastDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        0
    ).getDate();

    state.firstDayIndex = date.getDay();

    state.lastDayIndex = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0
    ).getDay();

    state.nextDays = 7 - state.lastDayIndex - 1;



    document.querySelector(".calendar-date h4").innerHTML = state.months[date.getMonth()];

    document.querySelector(".calendar-date p").innerHTML = date.getFullYear()

    let days = "";

    for (let x = state.firstDayIndex; x > 0; x--) {
        days += `<div class="prev-date">${state.prevLastDay - x + 1}</div>`;
    }

    for (let i = 1; i <= state.lastDay; i++) {
        if (
            i === new Date().getDate() &&
            date.getMonth() === new Date().getMonth()
        ) {
            days += `<div class="today">${i}</div>`;
        } else {
            days += `<div>${i}</div>`;
        }
    }

    for (let j = 1; j <= state.nextDays; j++) {
        days += `<div class="next-date">${j}</div>`;
        state.monthDays.innerHTML = days;
    }
};



document.querySelector('.saito-calendar-small').innerHTML = template;

renderCalendar();

document.querySelector(".calendar-prev").addEventListener("click", () => {

    date.setMonth(date.getMonth() - 1);

    renderCalendar();
});

document.querySelector(".calendar-next").addEventListener("click", () => {
    date.setMonth(date.getMonth() + 1);
    renderCalendar();
});





