{
     let freetime = [{ 
          start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8),           
          ending: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 22)
     }];

     let symbol = "First";
     let plans = getPlans();

     plans[symbol] ??= [];
     setPlans(plans);


     let planner = function () {
          clearDay();
          planPassivities();
          planActivities();
          console.log(getPlans()['First'])
     }

     function clearDay() {
          freetime = [{
               start: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8),
               ending: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 22)
          }];
          localStorage.setItem(`${symbol}T`, JSON.stringify({}));
     }

     let planPassivities = function () {
          let passivities = getPassivities();
          if (!passivities.length) return;
          for (let elem of passivities) {
               if (elem.schedule[date.getDay()]){
                    elem.start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), elem.start.getHours(), elem.start.getMinutes())
                    createWork(elem); 
               } 
          }     
     }

     let planActivities = function () {

          if (freetime.length == 0) return;

          let interval = freetime[0];
          let duration = interval.ending - interval.start;
          
          let actualActivities = getActivities().filter(index => {
               return index.min <= duration && getPlans()[symbol].at(-1)?.name !== index.name;
          });
          
          actualActivities.push({
               name: 'leisure',
               min: 1,
               max: 1000 * 3600 * 20,
               weight: 0,
               weekTime: [0, 0, 0, 0, 0, 0, 1],
               precedence: 0,
          });

          let activitiesTimes = JSON.parse(localStorage.getItem(`${symbol}T`));

          actualActivities.sort((a, b) => {
               let aP = a.weight / (a.weekTime.reduce((sum, current) => sum + current, 0) + (activitiesTimes[a.name] ?? 0));
               let bP = b.weight / (b.weekTime.reduce((sum, current) => sum + current, 0) + (activitiesTimes[b.name] ?? 0));

               return (aP > bP) ? -1 : (aP < bP) ? 1 : 0;   
               // return (a.precedence > b.precedence) ? -1 : (a.precedence < b.precedence) ? 1 : 0;
          });

          let activity = actualActivities[0];
          let workDuration = Math.min(duration, activity.max);

          createWork({ 
               name: activity.name, 
               start: interval.start, 
               duration: workDuration,
               ending: Number(+interval.start + workDuration),
          });

          // console.log(activitiesTimes)
          activitiesTimes[activity.name] = (activitiesTimes[activity.name] ?? 0 ) + workDuration;
          localStorage.setItem(`${symbol}T`, JSON.stringify(activitiesTimes));
          planActivities();     
     }


     let createWork = function (element) {
          let plans = getPlans();
          // console.log(freetime[0])
          // console.log(element)
          plans[symbol].push(new Work(element.name, element.start, element.duration));
          plans[symbol].sort((a, b) => {
               return (a.start > b.start) ? 1 : (a.start < b.start) ? -1 : 0;
          });

          setPlans(plans);


          for (let i = 0; i < freetime.length; i++) {
               // console.log(`${freetime[i].start}  ${element.start}  ${freetime[i].ending}  ${element.ending}`);
               if (freetime[i].start <= element.start && freetime[i].ending >= element.ending) {
                    if (+freetime[i].ending !== +element.ending) {
                         freetime.splice(i + 1, 0, { start: new Date(element.ending), ending: new Date(freetime[i].ending) });
                    }
                    if (+freetime[i].start !== +element.start) {
                         freetime.splice(i + 1, 0, { start: new Date(freetime[i].start), ending: new Date(element.start) });
                    }
                    freetime.splice(i, 1);
                    break;
               }
          }
     }


     dayCreators.push(planner);
}









