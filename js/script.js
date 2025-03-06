// website loaded?
console.log("👍 Okay");


// Days Until an Event


// Streak of Days


// Age of Person, Place, or Thing
// Unit Test
const birthDate = "1973-09-29"; // YYYY-MM-DD format
// const birthDateOfSwoop = "September 29, 1973"; // Month DD, YYYY
// const birthDateOfSwoop = "09/09/1973"; // MM/DD/YYYY
const ageOfPerson = calculateAgeOf( birthDate );
console.log( ageOfPerson );

// Unit test
// Get HTML element
const elemAgeOfPerson = document.querySelector('.ageOfPerson');

// Set to HTML element
elemAgeOfPerson.textContent = ageOfPerson;
elemAgeOfPerson.setAttribute("datetime", ageOfPerson );
