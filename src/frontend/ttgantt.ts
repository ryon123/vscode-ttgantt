(function () {
  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case 'update':
        let gantt: TTGantt = parseText(message.text);
        drawTimeline(gantt);
        drawTasks(gantt);
        break;
    }
  });
}());

interface Task {
  name: string;
  startDate: Date;
  endDate: Date;
}

interface Section {

}

interface TTGantt {
  current: Date;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
}

function parseText(text: string): TTGantt {
  const today1 = new Date(new Date().setHours(0, 0, 0, 0));
  const today2 = new Date(new Date().setHours(0, 0, 0, 0));
  let gantt: TTGantt = {
    current: today1,
    startDate: new Date(today1.setDate(today1.getDate() - 1)),
    endDate: new Date(today2.setDate(today2.getDate() + 15)),
    tasks: [{name: "Sample", startDate: new Date(today1.setDate(today1.getDate() + 3)), endDate: new Date(today2.setDate(today2.getDate() - 7))} ]
    //tasks: [{name: "Sample", startDate: new Date(2020, 3, 28), endDate: new Date(2020, 4, 3)} ]
  };
  return gantt;
}

function drawTimeline(gantt: TTGantt) {
  const dayObj = document.getElementById("day-task-area");
  if (dayObj === null) {
    return;
  }
  dayObj.innerHTML = ''; // TODO: initialize should be moved to outside of this method.
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

function drawTasks(gantt: TTGantt) {
  let areaWidth = ((gantt.endDate.getTime() - gantt.startDate.getTime()) / 86400000 + 1) * 15;
  let chartElement = document.createElement('div');
  chartElement.style.width = `${areaWidth}px`;
  chartElement.className = 'task-area';
  for(let task of gantt.tasks) {
    if(task.endDate.getTime() < gantt.startDate.getTime() || task.startDate.getTime() > gantt.endDate.getTime() + 86400000) { 
      continue;
    }
    let startOffset = (task.startDate.getTime() - gantt.startDate.getTime()) / 86400000;
    if(startOffset < 0) {
      startOffset = 0;
    }
    let endTime = (task.endDate.getTime() > gantt.endDate.getTime()) ? gantt.endDate.getTime(): task.endDate.getTime();
    let endOffset = (endTime - gantt.startDate.getTime()) / 86400000 + 1;
    let left = startOffset * 15;
    let width = (endOffset - startOffset) * 15;
    chartElement.insertAdjacentHTML('beforeend', `<div class="task"><span style="margin-left:${left}px; width:${width}px;" class="bar"></span></div>`);
  }
  const taskObj = document.getElementById("day-task-area");
  if (taskObj === null) {
    return;
  }
  taskObj.appendChild(chartElement);
}