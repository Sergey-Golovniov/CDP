'use strict'
let creator = document.querySelector('.creator');

creator.addEventListener('click', showCreator);

function showCreator(event) {
     creator.style.display = 'block';
     event.stopPropagation();
     observer.style.display = 'none';
}

document.querySelector('body').addEventListener('click', function() {
     creator.style.display = 'none';
     document.querySelector('.passivities').style.display = 'none';
     document.querySelector('.activities').style.display = 'none';
});



let changerA = document.querySelector('.activities button');
let changerP = document.querySelector('.passivities button');

changerA.addEventListener('click', function(event) {
     let inputs = [];
     for (let item of document.querySelectorAll('.activities .field input')){
          if (item.value == '') {
               alert('data is invalid');
               return;
          }
          inputs.push(item.value)
     }

     createActivity(new Activity(inputs[0], inputs[1] * 60 * 1e3, inputs[2] * 60 * 1e3, inputs[3]));

     document.querySelectorAll('.passivities .field input').forEach(item => item.value = '');
     document.querySelectorAll('.activities .field input').forEach(item => item.value = '');

     createDay();

     showObserver(event);
});

changerP.addEventListener('click', function (event) {
     let inputs = [];

     for (let item of document.querySelectorAll('.passivities .field:not(.checkboxes) input')) {
          if (item.value == '' || (item.value.split(':').length != 2 && item === document.querySelector('.passivities .field input:nth-of-type(2)'))) {
               alert('data is invalid');
               return;
          }
          inputs.push(item.value)
     }

     let schedule = []; 

     for (let node of document.querySelectorAll('input[type="checkbox"]')) {
          schedule.push(node.classList.contains('checked'));
     }

     schedule.unshift(schedule.pop());


     let date = new Date();
     createPassivity(new Passivity(inputs[0],
               new Date(date.getFullYear(), date.getMonth(), date.getDate(), inputs[1].split(':')[0], inputs[1].split(':')[1]),
               inputs[2] * 60 * 1e3,
               schedule,
     ));

     createDay();
     
     showObserver(event);
});


document.querySelectorAll('input[type="checkbox"]').forEach(item => item.addEventListener('click', () => item.classList.toggle('checked')));





let showObserverButton = document.querySelector('.showObserver');
let observer = document.querySelector('.observer');


document.querySelector('body').addEventListener('click', function () {
     observer.style.display = 'none';
});

showObserverButton.addEventListener('click', showObserver);
observer.addEventListener('click', showObserver);

function showObserver(event) {
     observer.style.display = 'block';
     event.stopPropagation();

     creator.style.display = 'none';
     document.querySelector('.passivities').style.display = 'none';
     document.querySelector('.activities').style.display = 'none';

     let passivities = getPassivities();

     let tableP = document.querySelector('.passivitiesT');

     let rowsP = document.querySelectorAll('.passivitiesT tr');
     for(let i = 1; i < rowsP.length; i++) {
          rowsP[i].remove();
     }
     let rowsA = document.querySelectorAll('.activitiesT tr');
     for (let i = 1; i < rowsA.length; i++) {
          rowsA[i].remove();
     }

     for (let passivity of passivities) {
          let row = document.createElement('tr');

          tableP.append(row);

          let name = document.createElement('td');
          let start = document.createElement('td');
          let duration = document.createElement('td');
          let schedule = document.createElement('td');

          let removerField = document.createElement('td');
          let remover = document.createElement('button');

          row.append(name);
          row.append(start);
          row.append(duration);
          row.append(schedule);
          row.append(removerField);

          removerField.append(remover);
          remover.innerHTML = 'X';

          name.innerHTML = passivity.name;
          start.innerHTML = `${ passivity.start.getHours() }:${ 
               (+passivity.start.getMinutes() > 9 ? passivity.start.getMinutes() : `0${passivity.start.getMinutes()}`) 
          }`;
          duration.innerHTML = passivity.duration / 1e3 / 60;
          schedule.innerHTML = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'].filter((e, i) => passivity.schedule.slice(1).concat(passivity.schedule[0])[i]); 

          remover.addEventListener('click', function() {
               deletePassivity(passivity.name);
               row.remove();
          });

          [name, start, duration, schedule].forEach(item => item.addEventListener('click', function (event) {
               showCreator(event);
               passivitiesF();



               let inputs = document.querySelectorAll('.passivities .field input');
               inputs[0].value = passivity.name;
               inputs[1].value = `${passivity.start.getHours()}:${(+passivity.start.getMinutes() > 9 ? passivity.start.getMinutes() : `0${passivity.start.getMinutes()}`)}`;
               inputs[2].value = passivity.duration / 1e3 / 60;

               for(let i = 0; i < document.querySelectorAll('input[type="checkbox"]').length; i++){
                    if (passivity.schedule.slice(1).concat(passivity.schedule[0])[i])  {
                         document.querySelectorAll('input[type="checkbox"]')[i].checked = true;
                         document.querySelectorAll('input[type="checkbox"]')[i].classList.add('checked');
                    }
               } 
          }));
     }

     let activities = getActivities();
     let tableA = document.querySelector('.activitiesT');

     for (let activity of activities) {

          let row = document.createElement('tr');

          tableA.append(row);

          let name = document.createElement('td');
          let min = document.createElement('td');
          let max = document.createElement('td');
          let weight = document.createElement('td');

          let removerField = document.createElement('td');
          let remover = document.createElement('button');

          row.append(name);
          row.append(min);
          row.append(max);
          row.append(weight);
          row.append(removerField);

          removerField.append(remover);
          remover.innerHTML = 'X';

          name.innerHTML = activity.name;
          min.innerHTML = activity.min / 1e3 / 60;
          max.innerHTML = activity.max / 1e3 / 60;
          weight.innerHTML = activity.weight;

          remover.addEventListener('click', function () {
               deleteActivity(activity.name);
               row.remove();
          });

          [name, min, max, weight].forEach(item => item.addEventListener('click', function (event) {
               showCreator(event);
               activitiesF();

               let inputs = document.querySelectorAll('.activities .field input');
               inputs[0].value = activity.name;
               inputs[1].value = activity.min / 1e3 / 60;
               inputs[2].value = activity.max / 1e3 / 60;
               inputs[3].value = activity.weight;
          }));
     }

     
}

let newPB = document.querySelectorAll('.new')[0];
newPB.addEventListener('click', function (event) { showCreator(event); passivitiesF() } );

let newAB = document.querySelectorAll('.new')[1];
newAB.addEventListener('click', function (event) { showCreator(event); activitiesF() });



function activitiesF() {
     document.querySelector('.passivities').style.display = 'none';
     document.querySelector('.activities').style.display = 'flex';

     document.querySelectorAll('.passivities .field:not(.checkboxes) input').forEach(item => item.value = '');
}


function passivitiesF() {
     document.querySelector('.passivities').style.display = 'flex';
     document.querySelector('.activities').style.display = 'none';

     document.querySelectorAll('.passivities .field:not(.checkboxes) input').forEach(item => item.value = '');

     document.querySelectorAll('input[type="checkbox"]').forEach(item => item.checked = false);
     document.querySelectorAll('input[type="checkbox"]').forEach(item => item.classList.remove('checked'));
}




