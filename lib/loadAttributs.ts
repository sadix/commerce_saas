import { log } from "console";
import { request } from "http";
import { JSONValue } from "next/dist/server/config-shared";
import { promises as fs } from 'fs';
import { ca } from "zod/v4/locales";



async function writeToFileAsync(filePath: string, data: string): Promise<void> {
  try {
    await fs.writeFile(filePath, data, { encoding: 'utf8' });
    console.log(`Data written to ${filePath} successfully (async).`);
  } catch (error) {
    console.error('Error writing to file:', error);
  }
}

async function main(){
const response = await fetch('http://localhost:3001/attributes',
    
);
const data = await response.json();

const newData = data.map((attr:Record<string, any>) => {
    const values = attr.values.map((obj:any) => {
        return(
            obj.name
        );
    });

    return(
       { id: attr.id, name: attr.name, type: 'select', options: values, required: true }
    );

});

//console.log(data);
console.log(newData);
const jsonString: string = JSON.stringify(newData);
writeToFileAsync('C:/Users/Saliou/Desktop/AttributesWithId.json',`${jsonString}`);
}



async function categoryMain(){
const response = await fetch('http://localhost:3001/verticals',
    
);
const data = await response.json();

const newData = data.map((attr:Record<string, any>) => {
    const categories = attr.categories.map((obj:any) => {
        return(
            {
                id: obj.id,
                name: obj.name,
                parent_id: obj.parent_id,
                attributes: obj.attributes,
                children: obj.children
            }
        );
    });

    return(
       { name: attr.name,  categories: categories}
    );

});

//console.log(data);
//console.log(newData);
const jsonString: string = JSON.stringify(newData);
//console.log(jsonString);
writeToFileAsync('C:/Users/Saliou/Desktop/CategoryWithId.json',`${jsonString}`);
}



//main();
categoryMain();