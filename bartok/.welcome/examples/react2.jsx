// Code snippets from http://facebook.github.io/react/docs/jsx-in-depth.html

// Rendering HTML tags
var myDivElement = <div className="foo" />;

// Rendering React components
class MyComponent extends Component {
  render() {
    return (
      <div></div>
    );
  }
}
var myElement = <MyComponent someProperty={true} />;

const Nav = MyComponent;
const Person = MyComponent;

// Namespaced components
//var Form = MyFormComponent;

/*
var App = (
  <Form>
    <Form.Row>
      <Form.Label />
      <Form.Input />
    </Form.Row>
  </Form>
);
*/

// Attribute JavaScript expressions
//var person = <Person name={window.isLoggedIn ? window.name : ''} />;

// Boolean attributes
//<input type="button" disabled />;
//<input type="button" disabled={true} />;

// Child JavaScript expressions
const Container = MyComponent;
const Login = MyComponent;
var content = <Container>{window.isLoggedIn ? <Nav /> : <Login />}</Container>;

// Comments
var Content = () => (
  <Nav>
    {/* child comment, put {} around */}
    <Person
      /* multi
         line
         comment */
      name={window.isLoggedIn ? window.name : ''} // end of line comment
    />
  </Nav>
);

//three
const App = () => {
  return (
    <div>
      Blurptny
      <myDivElement />
      <MyComponent />
      <myElement />
      <Content />
    </div>
  );
};
