const BOX_SIZE: number = 20;

(function () {
  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case 'update':
        let gantt: TTGantt | undefined = parseText(message.text);
        if(gantt !== undefined) {
          drawTimeline(gantt);
          drawTasks(gantt);
        }
        break;
    }
  });
}());

function onSaveClick() {
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

interface Event {
  name: string;
  date: Date;
}

interface Task {
  name: string;
  startDate: Date;
  endDate: Date;
  events: Event[];
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
  if(key === "current" || key === "date" || key === "startDate" || key === "endDate") {
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
    let day = "";
    if(d.getDay() === 0) {
      day = "sunday-background";
    } else if(d.getDay() === 6) {
      day = "saturday-background";
    }
    chartElement.insertAdjacentHTML('beforeend', `<div style="width: ${BOX_SIZE-1}px; height:${BOX_SIZE}px;" class="day ${day}">${d.getDate()}</div>`);
    d.setDate(d.getDate() + 1);
  }
  dayObj.appendChild(chartElement);
  const myObj = document.getElementById("month-year-area");
  if (myObj === null) {
    return;
  }
  myObj.innerHTML = '';
  for (let key in mycount) {
    let width = mycount[key] * BOX_SIZE - 1;
    myObj.insertAdjacentHTML('beforeend', `<div style="width:${width}px;" class="month-year">${key}</div>`);
  }
}

function getMonthYear(d: Date): string {
  let y = d.getFullYear();
  let m = d.getMonth() + 1;
  return String(m) + '-' + String(y);
}

function drawTasks(gantt: TTGantt) {
  let areaWidth = ((gantt.endDate.getTime() - gantt.startDate.getTime()) / 86400000 + 1) * BOX_SIZE;
  const ganttObj = document.getElementById("TTGantt");
  if (ganttObj === null) {
    return;
  }
  ganttObj.style.width = `${areaWidth}px`;
  let chartElement = document.createElement('div');
  chartElement.style.width = `${areaWidth}px`;
  chartElement.style.top = `${BOX_SIZE}px`;
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
    let left = startOffset * BOX_SIZE;
    let width = (endOffset - startOffset) * BOX_SIZE;
    chartElement.insertAdjacentHTML('beforeend', `<div class="task">
    <span style="margin-left:${left}px; width:${width}px;" class="bar"></span>
    <span class="bar-name">${task.name}</span>
    </div>`);
    if(task.events === null || task.events === undefined) {
      continue;
    }
    for(let event of task.events) {
      console.log(event.name);
      console.log(event.date);
    }
  }
  const taskObj = document.getElementById("day-task-area");
  if (taskObj === null) {
    return;
  }
  taskObj.appendChild(chartElement);
  taskObj.style.height = `${gantt.tasks.length * BOX_SIZE + BOX_SIZE}px`;
}