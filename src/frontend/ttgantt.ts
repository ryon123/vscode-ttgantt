(function () {
  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case 'update':
        let gantt: TTGantt | undefined = parseText(message.text);
        if(gantt !== undefined) {
          drawTimeline(gantt);
          drawTasks(gantt);
          let element: HTMLElement | null = document.querySelector("#TTGantt");
          if(element) {
            html2canvas(element).then(canvas => {
              let imageData = canvas.toDataURL();
              let a = document.createElement('a');
              a.href = canvas.toDataURL();
              a.download = 'download.png';
              a.click();
            });
          }
        }
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

function parseText(text: string): TTGantt | undefined {
  try {
    const gantt: TTGantt = JSON.parse(text, parseDate) as TTGantt;
    return gantt;
  } catch {
    return undefined;
  }
}

function parseDate(key: string, val: string) {
  if(key === "current" || key === "startDate" || key === "endDate") {
    const d: Date = new Date(Date.parse(val));
    return new Date(d.setHours(0, 0, 0, 0));
  }
  return val;
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
  const ganttObj = document.getElementById("TTGantt");
  if (ganttObj === null) {
    return;
  }
  ganttObj.style.width = `${areaWidth}px`;
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
  taskObj.style.height = `${gantt.tasks.length * 15 + 15}px`;
}