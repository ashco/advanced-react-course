import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';

const CURRENT_USER_QUERY = gql`
  query {
    me {
      id
      email
      name
      permissions
      orders {
        id
      }
      cart {
        id
        quantity
        item {
          id
          price
          image
          title
          description
        }
      }
    }
  }
`;

// This allows us to wrap anything that needs user data in a User Component, keeps query contained in here. Super clean!
const User = props => (
  // any props that are passed to User component are spread out, passed down
  <Query {...props} query={CURRENT_USER_QUERY}>
    {/* payload (aka returned data) is passed down as a prop to children */}
    {payload => props.children(payload)}
  </Query>
);

// Only thing that can be passed as a child is a function
User.propTypes = {
  children: PropTypes.func.isRequired,
};

export default User;
export { CURRENT_USER_QUERY };
