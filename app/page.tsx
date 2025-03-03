'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import BlackjackEndlessEnhanced from '@/components/games/BlackjackEndlessEnhanced'

export default function Home() {
  const [currentGame, setCurrentGame] = useState(null)
  
  const games = [
    { name: 'Blackjack Survival', component: BlackjackEndlessEnhanced }
  ]
  
  const GameComponent = currentGame ? games.find(g => g.name === currentGame)?.component : null

  return (
    <main className="min-h-screen p-4 md:p-8">
      {!currentGame ? (
        <div className="max-w-4xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl">Project 63 Casino Games</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Select a game to play from the collection below.</p>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <Card key={game.name} className="hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => setCurrentGame(game.name)}>
                <CardHeader>
                  <CardTitle>{game.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Play</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            className="mb-4"
            onClick={() => setCurrentGame(null)}
          >
            ← Back to Games
          </Button>
          
          {GameComponent && <GameComponent />}
        </div>
      )}
    </main>
  )
}
