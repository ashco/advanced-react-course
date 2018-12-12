import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import Head from 'next/head';
import Link from 'next/link';

import { perPage } from '../config';
import PaginationStyles from './styles/PaginationStyles';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => (
  <Query query={PAGINATION_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <p>Loading...</p>;
      const count = data.itemsConnection.aggregate.count;
      const pages = Math.ceil(count / perPage);
      const page = props.page;
      return (
        <PaginationStyles data-test="pagination">
          <Head>
            <title>
              Sick Fits! Page {page} of {pages}
            </title>
          </Head>
          <Link
            // prefetch - will prerender linked page (only in production mode) - snappier website!
            prefetch // this can cause issues when running tests because it will call router in test when router isn't loaded
            href={{
              pathname: 'items',
              query: {
                page: page - 1,
              },
            }}
          >
            <a className="prev" aria-disabled={page <= 1}>
              ← Prev
            </a>
          </Link>
          <p>
            Page {props.page} of
            <span className="totalPages">{pages}</span>
          </p>
          <p>{count} Items Total</p>
          <Link
            // prefetch - will prerender linked page (only in production mode) - snappier website!
            prefetch
            href={{
              pathname: 'items',
              query: {
                page: page + 1,
              },
            }}
          >
            <a className="next" aria-disabled={page >= pages}>
              Next →
            </a>
          </Link>
        </PaginationStyles>
      );
    }}
  </Query>
);

export default Pagination;
export { PAGINATION_QUERY };
