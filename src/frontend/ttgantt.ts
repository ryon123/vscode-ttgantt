(function () {
  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case 'update':
        let gantt: TTGantt = parseText(message.text);
        drawTimeline(gantt);
        break;
    }
  });
}());

interface Task {

}

interface Section {

}

interface TTGantt {
  current: Date;
  startDate: Date;
  endDate: Date;
}

function parseText(text: string): TTGantt {
  const today1 = new Date();
  const today2 = new Date();
  let gantt: TTGantt = {
    current: today1,
    startDate: new Date(today1.setDate(today1.getDate() - 1)),
    endDate: new Date(today2.setDate(today2.getDate() + 15))
  };
  return gantt;
}

function drawTimeline(gantt: TTGantt) {
  const dayObj = document.getElementById("day-task-area");
  if (dayObj === null) {
    return;
  }
  dayObj.innerHTML = '';
  let height = 15; // TODO: calculate from total tasks.
  let termDay = (gantt.endDate.getTime() - gantt.startDate.getTime()) / 86400000;
  let d: Date = new Date(gantt.startDate.getTime());
  let chartElement = document.createElement('div');
  chartElement.className = 'day-area';
  let mycount: { [key: string]: number; } = {};
  for(let i = 0; i <= termDay; i++) {
    let my = getMonthYear(d);
    if(mycount[my]) {
      mycount[my]++;
    } else {
      mycount[my] = 1;
    }
    chartElement.insertAdjacentHTML('beforeend', `<div style="height:${height}px;" class="day">${d.getDate()}</div>`);
    d.setDate(d.getDate() + 1);
  }
  dayObj.appendChild(chartElement);
  const myObj = document.getElementById("month-year-area");
  if (myObj === null) {
    return;
  }
  myObj.innerHTML = '';
  for (let key in mycount) {
    let width = mycount[key] * 15 - 1;
    myObj.insertAdjacentHTML('beforeend', `<div style="width:${width}px;" class="month-year">${key}</div>`);
  }
}

function getMonthYear(d: Date): string {
  let y = d.getFullYear();
  let m = d.getMonth() + 1;
  return String(m) + '-' + String(y);
}
