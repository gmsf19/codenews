import { GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import Link from 'next/link';

import { getPrismicClient } from '../../services/prismic';

import styles from './styles.module.scss';


type Publication = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

interface PublicationsProps {
  posts: Publication[]
}

export default function Posts({ posts }: PublicationsProps) {
  return (
    <> 
      <Head>
        <title>Posts | Code.News</title>
      </Head>

      <main className={styles.container}>
        <div className={styles.posts}>
          { posts.map(publication => (
            <Link href={`/posts/${publication.slug}`}>
              <a key={publication.slug}>
                <time>{publication.updatedAt}</time>
                <strong>{publication.title}</strong>
                <p>{publication.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export const getStaticProps : GetStaticProps = async () => {
  const prismic = getPrismicClient()

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'publication')
  ] , {
    fetch: ['publication.title', 'publication.content'],
    pageSize: 100,
  })

  const posts = response.results.map(publication => {
    return {
      slug: publication.uid,
      title: RichText.asText(publication.data.title),
      excerpt: publication.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(publication.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: {posts}
  }  
}