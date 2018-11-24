import UpdateItem from '../components/UpdateItem';

// url query (?id=cjov2lgtuag610a7148gcpo0p&ash=dope) will pass down props (ash: dope)
const Update = ({ query }) => (
  <div>
    <UpdateItem id={query.id} />
  </div>
);

export default Update;
