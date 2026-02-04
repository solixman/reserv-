import {IsNotEmpty, IsString} from 'class-validator';


export class GoogleLoginDto {
  
  @IsNotEmpty()
  @IsString()
  idToken: string; 
  

  constructor(idToken:string){
    this.idToken=idToken
  }
}
