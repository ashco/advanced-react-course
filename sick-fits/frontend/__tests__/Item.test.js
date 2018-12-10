import ItemComponent from '../components/Item';
import { shallow } from 'enzyme';
import toJSON from 'enzyme-to-json';

const fakeItem = {
  id: 'ABC123',
  title: 'A Cool Item',
  price: 4000,
  description: 'This item is really cool!',
  image: 'dog.jpg',
  largeImage: 'laredog.jpg',
};

describe('<Item/>', () => {
  it('renders and matches the snapshot', () => {
    // const price = '$50.35';
    // expect(price).toMatchSnapshot();
    const wrapper = shallow(<ItemComponent item={fakeItem} />);
    // toJSON removes all the extra jest stuff in the snapshot and just shows component
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  //   it('renders the image properly', () => {
  //     const wrapper = shallow(<ItemComponent item={fakeItem} />);
  //     const img = wrapper.find('img');
  //     // console.log(img.props());
  //     expect(img.props().src).toBe(fakeItem.image);
  //     expect(img.props().alt).toBe(fakeItem.title);
  //     // console.log(object);
  //   });

  //   it('renders the pricetag and title', () => {
  //     // will always call this wrapper jus cuz
  //     // check enzyme docs for lots of methods for shallow rendering
  //     // shallow render is just that... a shallow render: won't render deeper components
  //     const wrapper = shallow(<ItemComponent item={fakeItem} />);
  //     // console.log(wrapper.debug()); // .debug() will print out html
  //     const PriceTag = wrapper.find('PriceTag');
  //     // console.log(PriceTag.dive().text()); // dive will shallow render 1 level deeper
  //     // console.log(PriceTag.children()); // children will render stuff below
  //     expect(PriceTag.children().text()).toBe('$55'); // children will render stuff below
  //     expect(wrapper.find('Title a').text()).toBe(fakeItem.title);
  //   });

  //   it('renders out the buttons properly', () => {
  //     const wrapper = shallow(<ItemComponent item={fakeItem} />);
  //     const buttonList = wrapper.find('.buttonList');
  //     // console.log(buttonList.children());
  //     expect(buttonList.children()).toHaveLength(3);
  //     expect(buttonList.find('Link').exists()).toBeTruthy();
  //     expect(buttonList.find('AddToCart').exists()).toBeTruthy();
  //     expect(buttonList.find('DeleteItem').exists()).toBeTruthy();
  //   });
});
