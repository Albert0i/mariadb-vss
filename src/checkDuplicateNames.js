//node -v v23.10.0 
import data from "../data/writers.json" with { type: "json" };

function checkDuplicateNames(writers) {
    const namesSet = new Set();
    const duplicates = new Set();

    for (const writer of writers) {
        if (namesSet.has(writer.full_name)) {
            duplicates.add(writer.full_name); // If name is already in the set, add to duplicates
        } else {
            namesSet.add(writer.full_name); // Add name to the set
        }
    }

    return Array.from(duplicates); // Convert Set to Array if needed
}

/*
   main
*/
const duplicateNames = checkDuplicateNames(data);

console.log(`Number of writes is ${data.length}`)
console.log('Duplicated writer(s)')
console.log(duplicateNames); 