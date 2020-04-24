(function () {
  console.log("Typescript loaded correctly.");

  const counter = document.getElementById('TTGantt');
  if (counter !== null) {
    counter.textContent = "Loaded Typescript";
  }

  window.addEventListener('message', event => {
    const message = event.data; // The JSON data our extension sent
    switch (message.command) {
      case 'update':
        console.log("Update event received.");
        const contentObj = document.getElementById("TTGantt");
        if (contentObj !== null) {
          contentObj.textContent = message.text;
        }
        break;
    }
  });
}());
