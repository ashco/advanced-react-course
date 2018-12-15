import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import gql from 'graphql-tag';

import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';

import Error from './ErrorMessage';

// How form will send out data
const CREATE_ITEM_MUTATION = gql`
  mutation CREATE_ITEM_MUTATION(
    # Arguments to take
    $title: String!
    $description: String!
    $price: Int!
    $image: String
    $largeImage: String
  ) {
    # run createItem mutation that was defined in backend
    createItem(
      # use provided $variable as own name
      title: $title
      description: $description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      # return item id only
      id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: '',
    description: '',
    image: '',
    largeImage: '',
    price: 0,
  };

  // Very robust handle change func
  handleChange = e => {
    const { name, type, value } = e.target;
    // console.log({ name, type, value });
    // Convert strings to numbers when type is number
    const val = type === 'number' ? parseFloat(value) : value;

    this.setState({ [name]: val });
  };

  // Runs on change for file input
  uploadFile = async e => {
    // console.log('Uploading file...');
    const files = e.target.files;
    // Prep data for sendoff
    const data = new FormData();
    // Cloudinary requires following data
    data.append('file', files[0]);
    data.append('upload_preset', 'sickfits');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/ashco/image/upload',
      {
        method: 'POST',
        body: data,
      }
    );
    // Parse data that comes back, converts res into json
    const file = await res.json();
    // console.log(file);
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url, // secondary transform that happens
    });
  };

  render() {
    return (
      // Can pass in variables in component
      <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form
            data-test="form"
            onSubmit={async e => {
              // Stop form from submitting
              e.preventDefault();
              // call mutation
              const res = await createItem();
              // reroute user to single item page
              Router.push({
                pathname: '/item',
                query: { id: res.data.createItem.id },
              });
            }}
          >
            {/* Only shows error if there is an error */}
            <Error error={error} />
            {/* fieldset is cool because you can set it to disabled and prevent form from being used / submitting new data */}
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  required
                  onChange={this.uploadFile}
                />
                {this.state.image && (
                  <img
                    width="200px"
                    src={this.state.image}
                    alt="Upload Preview"
                  />
                )}
              </label>

              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  value={this.state.title}
                  onChange={this.handleChange}
                />
              </label>

              <label htmlFor="price">
                Price
                <input
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Price"
                  required
                  value={this.state.price}
                  onChange={this.handleChange}
                />
              </label>

              <label htmlFor="description">
                Description
                <textarea
                  id="description"
                  name="description"
                  placeholder="Enter A Description"
                  required
                  value={this.state.description}
                  onChange={this.handleChange}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
export { CREATE_ITEM_MUTATION };
