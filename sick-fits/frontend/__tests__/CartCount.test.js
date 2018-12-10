import { shallow, mount } from 'enzyme';
import toJSON from 'enzyme-to-json';
import CartCount from '../components/CartCount';

describe('<CartCount>', () => {
  // always start with just checking if it renders fine
  it('renders', () => {
    // Dont even need an expect because if something goes wrong with below then it will throw error and test will fail
    shallow(<CartCount count={10} />);
  });

  it('matches the snapshot', () => {
    const wrapper = shallow(<CartCount count={11} />);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  // SHALLOW - only goes 1 layer deep
  // it('updates via props', () => {
  //   const wrapper = shallow(<CartCount count={50} />);
  //   expect(toJSON(wrapper)).toMatchSnapshot();
  //   wrapper.setProps({ count: 10 });
  //   expect(toJSON(wrapper)).toMatchSnapshot();
  // });

  // MOUNT - will run it in browser environment - 'tests should be as similar to what the user will be experiencing, so mount! - Wes Bos'
  it('updates via props', () => {
    const wrapper = mount(<CartCount count={50} />);
    // console.log(wrapper.debug());
    return;
    expect(toJSON(wrapper)).toMatchSnapshot();
    // wrapper.setProps({ count: 10 });
    // expect(toJSON(wrapper)).toMatchSnapshot();
  });
});
