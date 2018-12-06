import PleaseSignIn from '../components/PleaseSignIn';
import Order from '../components/Order';

const OrdersPage = props => (
  <div>
    <PleaseSignIn>
      <Order id={props.query.id} />
    </PleaseSignIn>
  </div>
);

export default OrdersPage;
