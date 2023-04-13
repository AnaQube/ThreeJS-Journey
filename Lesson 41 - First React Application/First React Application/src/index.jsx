import './style.css'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

/**
 * 1. There are 3 ways to create React apps: npx create-react-app, npm init -y, and Vite.
 *    npx just runs the create script to install everything for you. Npm init -y is a manual type of install where you install the react, react-scripts, and react-dom packages.
 *    To install through vite, do npm create vite@latest
 * 2. Files that contain JSX (html in JS files/react stuff) must end in jsx for Vite to parse it.
 * 3. JSX is a tag-based language and it's similar to HTML. Indents don't really matter.
 * 4. The render must contain only one parent element but that element can have as many children as you want.
 * 5. A fragment is an empty tag element. It's a container that does not get rendered as a DOM element so you won't see it in the DOM tree.
 * 6. You can't use reserved JS keywords (class, for, const) in JSX. HTML 'class' becomes 'className' in JSX and 'for' becomes 'htmlFor'.
 * 7. Adding htmlFor on another element lets you click on that element to activate an input. So if you click on a label with htmlFor=(id of input), then it would work on the input.
 * 8. Single vs double quotes - Just keep it consistent
 * 9. You can inject variables using { variable name } and also some select Javascript functions in there (math, array map, functions, concat, strings, numbers, html tags...)
 *    If using backquotes ``, you can use ${ variable } to inject variables as well.
 * 10. You cannot use if(), for(), while(), etc... in the { }. Replace it with the var ? true : false
 * 
 * Style
 * 1. To add style, you can add it to the tag using the style={} attribute. The style attribute expects an object. An easier way is to just use a CSS file.
 * 2. Add classes to the tags using className and target them in the CSS file. There are also CSS frameworks like Tailwind.
 * @returns 
 * 
 * Components
 * 1. This is how you separate your app into multiple files. Pretty much the same as vanilla JS except some React quirks. You use the component as a tag to inject it.
 * 2. The component should return the React DOM structure that it would render. You can still put whatever JS code you want above the return.
 * 3. Vite/React works off of Hot Module Replacement which means the page doesn't reload. Only components that change will be reloaded.
 *    Sometimes this will bug out with Three.JS so make sure to reload if something isn't right.
 * 
 * Hooks and Events
 * 1. React works off of functions and sending them to the buttons/events. So a button would have the onClick attribute set to a function created by you. React docs have a bunch of attributes to find.
 * 2. Even with responsive events, the data is not reactive right now. React doesn't know if the data has changed if you just inject the variable using { var }. This is where state comes in.
 *    If a variable changes the component, it is a state variable and needs to do useState.
 * 3. useState is called a "hook". Hooks are called inside the component to do stuff related to the component. This is all React stuff. useState returns a variable and a function in an array.
 *    The variable will be the what you're changing and the function will be what to do to the variable when called. EX: useState(var), the return will be [var, function]. Function(var++) will update var.
 * 4. An easier way to destructure arrays is by doing const [ var1, var2 ] = useState(0)
 * 5. To save variables in local storage, there is an API called localStorage. You need to get the variable when the component is rendered for the first time and when it renders again.
 *    The useEffect hook will run every time the component is rendered. You can change when the useEffect hook is called by using the 2nd parameter option array to choose observation targets.
 *    An empty array means only run when component is first rendered. No argument means run every time something in the component changes/the component is re-rendered.
 * 6. To save the variable, use localStorage.setItem('var name', var). Doing "var ?? value" means that if the var is null or undefined, default to value.
 *    To get the variable on page reload, make another useEffect with no target, localStorage.getItem('var name') and set the variable using the same useState hook function.
 * 7. Right now, the component is rendering twice since the initial count is 0 and then useEffect will fetch from storage and set count again. Just move the getItem function to the first useState.
 * 8. You can also use ternary operators and boolean ops on components, EX: { hasClicker ? <Clicker /> : null } or { hasClicker && <Clicker /> }
 * 9. When a component is removed from the DOM, it is destroyed and will need to be rendered again to add it back.
 * 10. In the useEffect hook, you can return a function that is called when the component is destroyed (empty array). So one useEffect hook with empty array controls both first render and dispose.
 *     This is very unintuitive.
 * 
 * Props
 * 1. If you try to add multiple clickers, it won't save each click's data since one clicker will write to local storage last. You need "props" for each component.
 * 2. Add "keyName=" as an attribute to each Clicker. Add props parameter to the Clicker constructor. These attributes in the JSX tags will be sent as props to the component.
 *    Faster way to get props is to destructure them in the constructor args. EX: { keyName } as a parameter. Now you can use the keyName to save to localstorage.
 * 3. You can set default values to parameters by doing parameter = 'value'
 * 4. To make a random color, use HSL (Hue 0-360, Saturation 0-100, Lightness 0-100)
 * 5. There is a special prop called "children". This is whatever is inbetween the index's <App></App> tags. EX: <App> <h1> children props here </h1> </App>
 *    You can access these children props by adding it to the App constructor { children } and adding it to the return.
 *    Another way is to set the children property in the App tag.
 * 
 * Moving Data Up
 * 1. What if we want a global count? How do we get this data from the child components and display it in the App component? Don't try to pull data from the Clicker components.
 *    Instead, you will provide a function to the Clicker component to interact with parent data. Call the function whenever you need to increment the global count.
 * 
 * Loop
 * 1. What if we want to choose how many clickers we want? It's not ideal to copy and paste Clickers into App.
 * 2. You can send a prop to App for how many clickers you want in this index.jsx file. You can't do a for loop in the JSX return but there are other ways. Use a map method instead.
 *    The map method does a function for every value in an array. Create an empty array of length clickersCount and make a Clicker for every empty element and return that.
 *    If you want the index from the map method, you have to do (value, index) => {} since value always comes first. In this case, value is undefined cause it's empty.
 * 3. React will throw an error about list children should have a unique "key" prop. It's just an ID that the Clicker should have.
 * 
 * Saving Values
 * 1. The colors of the buttons keep changing everytime a button is clicked because the App is getting re-rendered due to the global count changing.
 * 2. One bad solution is to use a class variable to generate random colors once. This doesn't work if you have more than 1 App since both Apps will have the same color or have more Clickers.
 * 3. Do a for loop and generate however many clicker component colors in an array. Now, you have to save this array. useMemo is the solution.
 *    useMemo(function, [dependencies]) Whenever the dependency changes, useMemo is called again, otherwise useMemo will return the old value it had saved.
 * 4. useMemo is usually used for expensive calculations to not waste resources on each draw.
 * 
 * References
 * 1. What if we need to get something from the HTML DOM or ThreeJS components? We can use the useRef hook. This hook associates references with a target element.
 * 2. Make a const variable and set it to useRef(). The associated JSX tag can have the ref property set to this const to have it connected.
 *    On the first render, the ref will be undefined since the JSX didn't render yet.
 * 3. We can make use of useEffect since useEffect is called after the first render. You can create the const variable outside of useEffect and then do whatever you want to those elements in useEffect.
 * 
 * People Component
 * 1. Fetch data from an API using the fetch() function. This returns a promise which you can use a callback function to then display the data after JS is done getting data.
 * 2. Fetch will return the Promise, but you need to parse the JSON using response.json() which also returns a Promise so you gotta repeat. Instead of using const, you can chain the then functions.
 * 3. Another way instead of chaining is to put async in the function to tell JS that this function is async. Then use const variables to await every Promise function.
 * 
 * Performance & Virtual DOM
 * 
 */
const root = createRoot(document.querySelector('#root'))
const test = 'blue'
const h1Style = {
    color: test,
    backgroundColor: 'floralwhite'
}

root.render(
    <>
        {/* This is a comment */}
        <h1 style={ h1Style }>
            Hello React { test }
        </h1>
        <p className='cute-paragraph'>Lorem <strong>ipsum </strong>dolor sit amet consectetur, adipisicing elit. Repellendus nihil laudantium tenetur rerum explicabo totam nulla. Voluptate velit sapiente sequi blanditiis tempora qui voluptates quibusdam suscipit, facilis voluptatem voluptas magni!</p>
        <input type='checkbox' id='the-checkbox'></input>
        <label htmlFor='the-checkbox'>label here</label>

        <App clickersCount={ 3 }>
            <h1>H1 here</h1>
            <h2>H2 here</h2>
            <h3>H3 here</h3>
        </App>
    </>
)