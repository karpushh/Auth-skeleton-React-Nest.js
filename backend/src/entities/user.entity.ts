import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Idea } from 'src/entities/idea.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'text' })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  hashedRefreshToken?: string | null;

  @CreateDateColumn()
  createdDate: Date;

  @ManyToMany(() => Idea, (idea) => idea.followers)
  @JoinTable({
    name: 'user_followed_ideas', // name of the join table
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'ideaId',
      referencedColumnName: 'id',
    },
  })
  followedIdeas: Idea[];
}
