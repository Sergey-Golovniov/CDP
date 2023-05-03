class Activity {
     constructor(name, min, max, weight, weekTime, lastChanged) {
          this.name = name;
          this.min = min; // in ms
          this.max = max;
          this.weight = weight;
          this.weekTime = weekTime ?? [0, 0, 0, 0, 0, 0, 0];
          this.lastChanged = lastChanged ?? new Date();
     }
     get precedence() {
          return this.weight / this.weekTime;
     } 
}


class Work {
     constructor(name, start, duration) {
          this.name = name;
          this.start = start;
          this.duration = duration;
     }
     get ending() {
          return new Date(Number(this.start) + this.duration);
     }
}


class Passivity extends Work {
     constructor(name, start, duration, schedule) {
          super(name, start, duration);
          this.schedule = schedule;
     }
}


let date = new Date();

if(localStorage.getItem('plans') === null){
     setPlans({});
} 



let dayCreators = [];

document.querySelector('.reload').addEventListener('click', createDay);

function createDay () {
     let plans = getPlans();

     for (let elem in plans) {
          plans[elem] = [];
     }

     setPlans(plans);

     dayCreators.forEach(elem => elem());
}




if (!localStorage.getItem('activities')) 
     localStorage.setItem('activities', JSON.stringify({}));
if (!localStorage.getItem('passivities'))
     localStorage.setItem('passivities', JSON.stringify({}));



function getPlans() {
     return JSON.parse(localStorage.getItem('plans'), (key, value) => (key == 'start') ? new Date(value) : value);
}

function setPlans(value) {
     localStorage.setItem('plans', JSON.stringify(value));
}




function createActivity(activity) {
     let activities = JSON.parse(localStorage.getItem('activities'), (key, value) => (key == 'lastChanged') ? new Date(value) : value);

     activities[activity.name] = activity;

     localStorage.setItem('activities', JSON.stringify(activities));

}

function deleteActivity(name) {

     let activities = JSON.parse(localStorage.getItem('activities'), (key, value) => (key == 'lastChanged') ? new Date(value) : value);

     delete activities[name];

     localStorage.setItem('activities', JSON.stringify(activities));

}

function getActivities() {

     let activities = JSON.parse(localStorage.getItem('activities'), (key, value) => (key == 'lastChanged') ? new Date(value) : value);

     let result = [];

     for(let key in activities){
          let elem = activities[key];
          result.push(new Activity(elem.name, elem.min, elem.max, elem.weight, elem.weekTime, elem.lastChanged));
     }

     return result;
}
 
function createPassivity(passivity) {

     let passivities = JSON.parse(localStorage.getItem('passivities'), (key, value) => (key == 'start') ? new Date(value) : value);

     passivities[passivity.name] = passivity;

     localStorage.setItem('passivities', JSON.stringify(passivities));

}

function deletePassivity(name) {

     let passivities = JSON.parse(localStorage.getItem('passivities'), (key, value) => (key == 'start') ? new Date(value) : value);

     delete passivities[name];

     localStorage.setItem('passivities', JSON.stringify(passivities));

}

function getPassivities() {

     let passivities = JSON.parse(localStorage.getItem('passivities'), (key, value) => (key == 'start') ? new Date(value) : value);

     let result = [];

     for (let key in passivities) {
          let elem = passivities[key];
          result.push(new Passivity(elem.name, elem.start, elem.duration, elem.schedule));
     }

     return result;
}






function replaceWork(currentIndex, planName) {
     let plans = getPlans();

     let currentWork = plans[planName][currentIndex];

     let nextIndex = currentIndex + 1;
     let nextWork = plans[planName][nextIndex];

     if (nextWork === undefined) {
          console.log(`replaceWork: nextWork === undefined`);
          return;
     }

     plans[planName][currentIndex] = new Work(nextWork.name, currentWork.start, nextWork.duration);
     plans[planName][nextIndex] = new Work(currentWork.name, new Date(+currentWork.start + nextWork.duration), currentWork.duration);

     setPlans(plans);
}

function replaceWorkReversed(currentIndex, planName) {
     replaceWork(currentIndex - 1, planName)
}

function cutWork(currentIndex, planName) {
     let plans = getPlans();

     let nextIndex = currentIndex + 1;
     let nextWork = plans[planName][nextIndex];

     if (nextWork === undefined) {
          let removed = plans[planName][currentIndex];
          plans[planName].splice(currentIndex, 1, new Work('leisure', removed.start, removed.duration));

          if (getActivities().find(item => item.name === removed.name)) {
               let activitiesTimes = JSON.parse(localStorage.getItem(`${planName}T`));
               activitiesTimes[removed.name] -= removed.duration;
               localStorage.setItem(`${planName}T`, JSON.stringify(activitiesTimes));
          }

          setPlans(plans);
          return;
     } else {
          replaceWork(currentIndex, planName);
          cutWork(nextIndex, planName);
     } 

}

function changeWork(planName, index, newName, newStart, newDuration) {
     let plans = getPlans();
     let work = plans[planName][index];

     newName ??= work.name;
     newDuration ??= work.duration;

     if (getActivities().find(item => item.name === work.name)) {
          let activitiesTimes = JSON.parse(localStorage.getItem(`${planName}T`));
          activitiesTimes[work.name] -= work.duration;
          activitiesTimes[newName] += newDuration;
          localStorage.setItem(`${planName}T`, JSON.stringify(activitiesTimes));
     }

     work.name = newName;
     work.start = newStart ?? work.start;
     work.duration = newDuration;


     setPlans(plans);
}


