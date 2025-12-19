import { query } from './db'

// Database user authentication - NO FALLBACK
export async function authenticateUser(username: string, password: string) {
  console.log('Authenticating user from database:', username)
  
  try {
    // Query user from database - Role: 0 = Admin, 1 = User
    const result = await query(
      'SELECT iduser, usersname as username, site, username as user_login, password, department, userid, "Role" FROM useryc WHERE username = $1 AND password = $2 LIMIT 1',
      [username, password]
    )

    console.log('Query returned', result.rows.length, 'rows')

    if (result.rows.length === 0) {
      console.log('Invalid credentials - user not found')
      return null
    }

    const user = result.rows[0]
    console.log('User authenticated:', { username: user.user_login, role: user.Role })
    
    // Map database user to application format
    const userData = {
      id: user.iduser?.toString() || user.userid?.toString() || '1',
      username: user.user_login,
      email: `${user.user_login}@system.local`,
      role: (user.Role === 0) ? 'admin' : 'user',
      name: user.username || user.user_login,
      site: user.site || '00',
      department: user.department || '',
    }
    
    return userData
  } catch (error) {
    console.error('Database authentication failed:', error)
    if (error instanceof Error) {
      console.error('Error:', error.message)
    }
    throw error
  }
}

export async function getUserByUsername(username: string) {
  try {
    const result = await query(
      'SELECT iduser, usersname as username, site, username as user_login, department, userid, "Role" FROM useryc WHERE username = $1 LIMIT 1',
      [username]
    )

    if (result.rows.length === 0) {
      return null
    }

    const user = result.rows[0]
    
    return {
      id: user.iduser?.toString() || user.userid?.toString() || '1',
      username: user.user_login,
      email: `${user.user_login}@system.local`,
      role: (user.Role === 0) ? 'admin' : 'user',
      name: user.username || user.user_login,
      site: user.site || '00',
      department: user.department || '',
    }
  } catch (error) {
    console.error('Get user error:', error)
    throw error
  }
}
