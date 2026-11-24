import DrawingBoard from './DrawingBoard'

export const metadata = { title: 'ارسم | سَلِيم' }

export default function DrawPage({ searchParams }: { searchParams: { child?: string } }) {
  return <DrawingBoard childId={searchParams.child} />
}
